import type { APIRoute } from "astro";
import { calculatePersonalScore } from "../../../../lib/game-reviews";
import {
  findGameBySlug,
  readGames,
  slugifyGameTitle,
  writeGames,
  type GameCritique,
} from "../../../../lib/local-games";

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

function toBoundedNumber(value: unknown, min: number, max: number): number | null {
  const number = toNullableNumber(value);
  if (number === null || number < min || number > max) return null;
  return number;
}

function toGameCritique(value: unknown): GameCritique {
  const source =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const criteriaSource =
    typeof source.criterios === "object" && source.criterios !== null
      ? (source.criterios as Record<string, unknown>)
      : {};
  const honorarySource =
    typeof source.mencion_honorifica === "object" && source.mencion_honorifica !== null
      ? (source.mencion_honorifica as Record<string, unknown>)
      : {};

  return {
    metascore: toBoundedNumber(source.metascore, 0, 100),
    userscore: toBoundedNumber(source.userscore, 0, 10),
    criterios: {
      jugabilidad: toBoundedNumber(criteriaSource.jugabilidad, 1, 5),
      historia: toBoundedNumber(criteriaSource.historia, 1, 5),
      musica: toBoundedNumber(criteriaSource.musica, 1, 3),
      graficos_arte: toBoundedNumber(criteriaSource.graficos_arte, 1, 5),
      entretenimiento: toBoundedNumber(criteriaSource.entretenimiento, 1, 5),
    },
    mencion_honorifica: {
      nivel: toBoundedNumber(honorarySource.nivel, 0, 3),
      comentario: toNullableString(honorarySource.comentario),
    },
  };
}

function toNullablePositiveInteger(value: unknown): number | null {
  const num = toNullableNumber(value);
  if (num === null) return null;
  if (!Number.isFinite(num) || num < 1) return null;
  return Math.round(num);
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function toNullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "") return null;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
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

  // Partial patch: cada mini-formulario (general, dinero, comentarios) solo
  // manda sus propios campos. Si un campo no viene en el body, se conserva
  // el valor que ya tenía el juego — nunca se pisa con null por omisión.
  const updated = { ...game };

  if (body.estado !== undefined) updated.estado = toNullableString(body.estado) ?? game.estado;
  if (body.horas !== undefined) updated.horas = toNullableNumber(body.horas);
  if (body.fecha_inicio !== undefined) updated.fecha_inicio = toNullableString(body.fecha_inicio);
  if (body.fecha_fin !== undefined) updated.fecha_fin = toNullableString(body.fecha_fin);
  if (body.solo !== undefined) updated.solo = toNullableBoolean(body.solo);
  if (body.precio_pagado !== undefined) updated.precio_pagado = toNullableNumber(body.precio_pagado);
  if (body.unidades_compradas !== undefined) {
    updated.unidades_compradas = toNullablePositiveInteger(body.unidades_compradas);
  }
  if (body.gasto_microtransacciones !== undefined) {
    updated.gasto_microtransacciones = toNullableNumber(body.gasto_microtransacciones);
  }
  if (body.comentarios !== undefined) updated.comentarios = toNullableString(body.comentarios);
  if (body.critica !== undefined) {
    updated.critica = toGameCritique(body.critica);
    const honorary = updated.critica.mencion_honorifica;
    if ((honorary?.nivel ?? 0) > 0 && !honorary?.comentario) {
      return jsonResponse(400, {
        ok: false,
        error: "Explica el motivo de la mención honorífica.",
      });
    }
    updated.nota = calculatePersonalScore(updated.critica);
  }

  // Tags: el checkbox free_to_play solo se aplica si el formulario lo manda
  // explícitamente (junto al precio, desde el lápiz de Dinero). Si llega
  // body.tags como array/string por otro camino, se respeta tal cual.
  if (body.tags !== undefined) {
    updated.tags = toTagsArray(body.tags);
  } else if (body.free_to_play !== undefined) {
    updated.tags = toggleFreeToPlayTag(game.tags, body.free_to_play);
  }

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
