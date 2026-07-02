import type { APIRoute } from "astro";
import { findGameBySlug, readGames, slugifyGameTitle, writeGames } from "../../../../../lib/local-games";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 200;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normaliza un título para comparar por texto: sin acentos, minúsculas,
 * sin puntuación. Muchos DLCs de games.json se cargaron a mano o desde
 * otra fuente antes de que existiera steam_appid en el esquema, así que
 * la única forma de no duplicarlos es reconocerlos por título.
 */
const DIACRITICS_RANGE_START = 0x0300;
const DIACRITICS_RANGE_END = 0x036f;

function normalizeTitle(value: unknown): string {
  const decomposed = String(value ?? "").normalize("NFD");
  let stripped = "";
  for (const char of decomposed) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= DIACRITICS_RANGE_START && code <= DIACRITICS_RANGE_END) continue;
    stripped += char;
  }
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchWithTimeout(input: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, {
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSteamAppDetails(appId: number): Promise<any | null> {
  try {
    const response = await fetchWithTimeout(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=es&l=spanish`,
    );
    if (!response.ok) return null;
    const data = await response.json();
    const entry = data?.[String(appId)];
    if (!entry?.success || !entry?.data) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Llama a Steam para el appid base del juego, lee su lista `dlc` (appids)
 * y da de alta en games.json los que no estén ya en dlcs.items — como
 * "no adquirido" (fecha_adquisicion: null, precio_pagado: null), igual
 * que scripts/sync-steam-library-capsules.mjs pero on-demand desde la UI
 * y limitado a un solo juego.
 */
export const POST: APIRoute = async ({ params }) => {
  if (process.env.VERCEL) {
    return jsonResponse(501, {
      ok: false,
      error: "Esto solo está disponible en local (npm run dev) por ahora, porque escribe en games.json.",
    });
  }

  const slug = params.slug ?? "";
  if (!slug) {
    return jsonResponse(400, { ok: false, error: "Falta el slug del juego." });
  }

  const games = await readGames();
  const game = findGameBySlug(games, slug);
  if (!game) {
    return jsonResponse(404, { ok: false, error: `No se encontró ningún juego con slug "${slug}".` });
  }

  const appId = Number(game.steam_appid);
  if (!Number.isInteger(appId) || appId <= 0) {
    return jsonResponse(400, { ok: false, error: "Este juego no tiene steam_appid, no se puede consultar Steam." });
  }

  const baseData = await fetchSteamAppDetails(appId);
  if (!baseData) {
    return jsonResponse(502, { ok: false, error: "Steam no devolvió datos para el appid de este juego." });
  }

  const dlcAppIds: number[] = Array.isArray(baseData.dlc)
    ? baseData.dlc.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
    : [];

  const index = games.findIndex((g) => slugifyGameTitle(g.titulo) === slug);
  const existingItems = Array.isArray(game.dlcs?.items) ? [...game.dlcs!.items!] : [];
  const existingAppIds = new Set(
    existingItems.map((item) => Number(item.steam_appid)).filter((id) => Number.isInteger(id) && id > 0),
  );
  // Muchas entradas se cargaron antes de tener steam_appid en el esquema
  // (siguen sin él). Sin este índice por título, el sync las duplicaría
  // en vez de completarles el appid/portada que les falta.
  const titleIndex = new Map(existingItems.map((item, i) => [normalizeTitle(item.titulo), i]));

  const missingAppIds = dlcAppIds.filter((id) => !existingAppIds.has(id));

  let added = 0;
  let backfilled = 0;
  for (const dlcAppId of missingAppIds) {
    const dlcData = await fetchSteamAppDetails(dlcAppId);
    await sleep(REQUEST_DELAY_MS);
    if (!dlcData || typeof dlcData.name !== "string") continue;

    const coverUrl = typeof dlcData.header_image === "string" ? dlcData.header_image : null;
    const matchIndex = titleIndex.get(normalizeTitle(dlcData.name));

    if (matchIndex !== undefined) {
      // Ya existía por título (sin appid): se completa, no se duplica.
      existingItems[matchIndex] = {
        ...existingItems[matchIndex],
        steam_appid: dlcAppId,
        cover_url: existingItems[matchIndex].cover_url ?? coverUrl,
        cover_source: existingItems[matchIndex].cover_source ?? "Steam appdetails API",
      };
      backfilled += 1;
      continue;
    }

    existingItems.push({
      titulo: dlcData.name,
      cover_source: "Steam appdetails API",
      cover_url: coverUrl,
      steam_appid: dlcAppId,
      // No adquirido todavía: se reutiliza null en vez de un campo nuevo.
      fecha_adquisicion: null,
      precio_pagado: null,
      precio_actual: null,
      precio_salida: null,
      tamano: null,
      notas: null,
    });
    added += 1;
  }

  if (added > 0 || backfilled > 0) {
    const updated = {
      ...game,
      dlcs: {
        total: existingItems.length,
        items: existingItems,
      },
    };
    games[index] = updated;

    try {
      await writeGames(games);
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: `No se pudo escribir games.json: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return jsonResponse(200, { ok: true, added, backfilled, total: existingItems.length, game: updated });
  }

  return jsonResponse(200, { ok: true, added: 0, backfilled: 0, total: existingItems.length, game });
};
