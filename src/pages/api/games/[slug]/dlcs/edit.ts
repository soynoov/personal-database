import type { APIRoute } from 'astro';
import { requireEditor } from '../../../../../lib/edit-auth';
import {
  findGameBySlug,
  GamesVersionConflictError,
  readGames,
  slugifyGameTitle,
  writeGames,
} from '../../../../../lib/local-games';

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableIsoDate = (value: unknown): string | null => {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
};

const todayInMadrid = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

export const POST: APIRoute = async ({ params, request }) => {
  const authenticationError = requireEditor(request);
  if (authenticationError) return authenticationError;
  const slug = params.slug ?? '';
  if (!slug) return jsonResponse(400, { ok: false, error: 'Falta el slug del juego.' });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: 'Cuerpo de la petición no es JSON válido.' });
  }
  const patches = Array.isArray(body.items) ? body.items : null;
  if (!patches) return jsonResponse(400, { ok: false, error: 'Falta el array items.' });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const games = await readGames();
    const game = findGameBySlug(games, slug);
    if (!game) return jsonResponse(404, { ok: false, error: 'No se encontró el juego.' });
    const existing = game.dlcs?.items ?? [];
    if (patches.length !== existing.length) {
      return jsonResponse(400, {
        ok: false,
        error: 'El número de DLCs cambió. Recarga la página e inténtalo de nuevo.',
      });
    }

    const items = existing.map((item, index) => {
      const patch = patches[index] as Record<string, unknown> | undefined;
      if (!patch) return item;
      const wasOwned = Boolean(item.fecha_adquisicion);
      if (patch.owned !== true) return { ...item, fecha_adquisicion: null, precio_pagado: null };
      return {
        ...item,
        fecha_adquisicion:
          toNullableIsoDate(patch.fecha_adquisicion) ??
          (wasOwned ? item.fecha_adquisicion : todayInMadrid()),
        precio_pagado: toNullableNumber(patch.precio_pagado),
      };
    });
    const updated = {
      ...game,
      actualizado_en: new Date().toISOString(),
      dlcs: { total: items.length, items },
    };
    games[games.findIndex((item) => slugifyGameTitle(item.titulo) === slug)] = updated;

    try {
      await writeGames(games);
      return jsonResponse(200, { ok: true, game: updated });
    } catch (error) {
      if (error instanceof GamesVersionConflictError) {
        if (attempt === 0) continue;
        return jsonResponse(409, {
          ok: false,
          error: 'La biblioteca volvió a cambiar. Recarga la página e inténtalo de nuevo.',
        });
      }
      return jsonResponse(500, {
        ok: false,
        error: `No se pudo guardar la biblioteca: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return jsonResponse(409, { ok: false, error: 'No se pudo resolver el conflicto de edición.' });
};
