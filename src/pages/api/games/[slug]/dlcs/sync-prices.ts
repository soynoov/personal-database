import type { APIRoute } from "astro";
import { findGameBySlug, readGames, slugifyGameTitle, writeGames } from "../../../../../lib/local-games";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const REQUEST_TIMEOUT_MS = 8000;
const REQUEST_DELAY_MS = 300;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Consulta el precio actual de un DLC en la tienda de Steam (región ES).
 * Devuelve el precio en EUR, o 0 si es gratuito, o null si falla.
 */
async function fetchDlcPrice(appId: number): Promise<number | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=es&filters=price_overview`,
      { signal: controller.signal, headers: { "user-agent": USER_AGENT, accept: "*/*" } },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const entry = data?.[String(appId)];
    if (!entry?.success) return null;
    // DLC gratuito: success=true pero sin price_overview
    if (!entry.data?.price_overview) return 0;
    const final = entry.data.price_overview.final;
    return typeof final === "number" ? final / 100 : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Actualiza precio_actual en todos los DLCs del juego que tengan steam_appid.
 * Solo escribe en games.json (local). En Vercel devuelve 501.
 */
export const POST: APIRoute = async ({ params }) => {
  if (process.env.VERCEL) {
    return jsonResponse(501, {
      ok: false,
      error: "Solo disponible en local (npm run dev) porque escribe en games.json.",
    });
  }

  const slug = params.slug ?? "";
  if (!slug) return jsonResponse(400, { ok: false, error: "Falta el slug del juego." });

  const games = await readGames();
  const game = findGameBySlug(games, slug);
  if (!game) return jsonResponse(404, { ok: false, error: `No se encontró ningún juego con slug "${slug}".` });

  const items: any[] = Array.isArray(game.dlcs?.items) ? [...game.dlcs!.items!] : [];

  const candidates = items
    .map((dlc, i) => ({ dlc, i }))
    .filter(({ dlc }) => {
      const id = Number(dlc.steam_appid);
      return Number.isInteger(id) && id > 0;
    });

  if (candidates.length === 0) {
    return jsonResponse(200, { ok: true, updated: 0, total: items.length, message: "Ningún DLC tiene steam_appid." });
  }

  let updated = 0;
  let failed = 0;

  for (const { dlc, i } of candidates) {
    const price = await fetchDlcPrice(Number(dlc.steam_appid));
    await sleep(REQUEST_DELAY_MS);
    if (price === null) {
      failed++;
      continue;
    }
    items[i] = { ...items[i], precio_actual: price };
    updated++;
  }

  if (updated === 0) {
    return jsonResponse(200, {
      ok: true,
      updated: 0,
      failed,
      total: items.length,
      message: "Steam no devolvió precios para ningún DLC.",
    });
  }

  const index = games.findIndex((g) => slugifyGameTitle(g.titulo) === slug);
  games[index] = {
    ...game,
    dlcs: { ...game.dlcs, total: items.length, items },
  };

  try {
    await writeGames(games);
  } catch (err) {
    return jsonResponse(500, {
      ok: false,
      error: `No se pudo guardar games.json: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  return jsonResponse(200, { ok: true, updated, failed, total: items.length });
};
