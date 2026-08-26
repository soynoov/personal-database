import type { APIRoute } from 'astro';
import { requireEditor } from '../../../../lib/edit-auth';
import { applyManualGamePatch } from '../../../../lib/manual-game-edit';
import {
  findGameBySlug,
  GamesVersionConflictError,
  readGames,
  slugifyGameTitle,
  writeGames,
} from '../../../../lib/local-games';

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

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

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const games = await readGames();
    const game = findGameBySlug(games, slug);
    if (!game) {
      return jsonResponse(404, { ok: false, error: `No se encontró ningún juego con slug "${slug}".` });
    }

    const patched = applyManualGamePatch(game, body);
    if (!patched.ok) return jsonResponse(patched.status, patched);
    const index = games.findIndex((item) => slugifyGameTitle(item.titulo) === slug);
    games[index] = patched.game;

    try {
      await writeGames(games);
      return jsonResponse(200, { ok: true, game: patched.game });
    } catch (error) {
      if (error instanceof GamesVersionConflictError) {
        if (attempt === 0) continue;
        return jsonResponse(409, {
          ok: false,
          error: 'La biblioteca volvió a cambiar mientras guardabas. Recarga la página e inténtalo de nuevo.',
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
