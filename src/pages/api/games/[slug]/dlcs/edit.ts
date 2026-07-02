import type { APIRoute } from "astro";
import { findGameBySlug, readGames, slugifyGameTitle, writeGames } from "../../../../../lib/local-games";

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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Patchea precio_pagado y fecha_adquisicion de cada DLC ya registrado en
 * games.json (por posición en el array, mismo orden que se renderizó en
 * la ficha). No añade ni borra entradas — eso lo hace /dlcs/sync.
 *
 * "No adquirido" se representa reutilizando fecha_adquisicion=null y
 * precio_pagado=null (sin campo nuevo en el esquema), tal como se decidió
 * al plantear esta función.
 */
export const POST: APIRoute = async ({ params, request }) => {
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

  const items = Array.isArray(body.items) ? body.items : null;
  if (!items) {
    return jsonResponse(400, { ok: false, error: "Falta el array items en el cuerpo de la petición." });
  }

  const games = await readGames();
  const game = findGameBySlug(games, slug);
  if (!game) {
    return jsonResponse(404, { ok: false, error: `No se encontró ningún juego con slug "${slug}".` });
  }

  const index = games.findIndex((g) => slugifyGameTitle(g.titulo) === slug);
  const existingItems = Array.isArray(game.dlcs?.items) ? game.dlcs!.items! : [];

  if (items.length !== existingItems.length) {
    return jsonResponse(400, {
      ok: false,
      error: `El número de DLCs enviados (${items.length}) no coincide con los registrados (${existingItems.length}). Recarga la página e inténtalo de nuevo.`,
    });
  }

  const nextItems = existingItems.map((item, i) => {
    const patch = items[i] as { owned?: unknown; precio_pagado?: unknown } | undefined;
    if (!patch) return item;

    const wasOwned = item.fecha_adquisicion !== null && item.fecha_adquisicion !== undefined;
    const nowOwned = patch.owned === true;

    if (!nowOwned) {
      return { ...item, fecha_adquisicion: null, precio_pagado: null };
    }

    return {
      ...item,
      // Si ya tenía fecha, se conserva (no se pisa con la de hoy solo por
      // reguardar el precio). Si no tenía, se marca hoy como aproximación.
      fecha_adquisicion: wasOwned ? item.fecha_adquisicion : todayIso(),
      precio_pagado: toNullableNumber(patch.precio_pagado),
    };
  });

  const updated = {
    ...game,
    dlcs: {
      total: nextItems.length,
      items: nextItems,
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

  return jsonResponse(200, { ok: true, game: updated });
};
