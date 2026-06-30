import type { APIRoute } from "astro";
import { findGameBySlug, readGames, slugifyGameTitle, writeGames } from "../../../../lib/local-games";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function toTagsArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

const FREE_TO_PLAY_TAG = "free-to-play";

/**
 * El formulario no edita la lista de tags completa (se gestiona aparte).
 * Solo expone un checkbox "Free to play" que añade/quita exactamente ese
 * valor de tags, sin tocar ningún otro tag que ya tuviera el juego.
 */
function toggleFreeToPlayTag(existingTags: string[] | null | undefined, freeToPlay: unknown): string[] {
  const base = Array.isArray(existingTags)
    ? existingTags.filter((tag) => String(tag).trim().toLowerCase() !== FREE_TO_PLAY_TAG)
    : [];
  return freeToPlay === true ? [...base, FREE_TO_PLAY_TAG] : base;
}

export const POST: APIRoute = async ({ params, request }) => {
  // En Vercel el filesystem del deploy es de solo lectura: una escritura
  // aquí fallaría o se perdería en el siguiente cold start. Se avisa en vez
  // de fingir que se guardó. VERCEL=1 lo define la propia plataforma.
  if (process.env.VERCEL) {
    return jsonResponse(501, {
      ok: false,
      error: "El guardado solo está disponible en local (npm run dev) por ahora. En Vercel no hay forma de persistir el cambio en games.json.",
    });
  }

  const slug = params.slug ?? "";
  if (!slug) {
    return jsonResponse(400, { ok: false, error: "Falta el slug del juego." });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "Cuerpo de la petición no es JSON válido." });
  }

  const games = await readGames();
  const game = findGameBySlug(games, slug);
  if (!game) {
    return jsonResponse(404, { ok: false, error: `No se encontró ningún juego con slug "${slug}".` });
  }

  const index = games.findIndex((g) => slugifyGameTitle(g.titulo) === slug);

  const updated = {
    ...game,
    estado: toNullableString(body.estado) ?? game.estado,
    horas: toNullableNumber(body.horas),
    fecha_inicio: toNullableString(body.fecha_inicio),
    fecha_fin: toNullableString(body.fecha_fin),
    precio_pagado: toNullableNumber(body.precio_pagado),
    gasto_microtransacciones: toNullableNumber(body.gasto_microtransacciones),
    nota: toNullableNumber(body.nota),
    comentarios: toNullableString(body.comentarios),
    // Tags: el formulario solo manda free_to_play (booleano). Si por algún
    // otro camino llega body.tags como array/string, se respeta tal cual.
    tags:
      body.tags !== undefined ? toTagsArray(body.tags) : toggleFreeToPlayTag(game.tags, body.free_to_play),
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

  return jsonResponse(200, { ok: true, game: updated });
};
