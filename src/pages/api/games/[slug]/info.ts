import type { APIRoute } from 'astro';
import { findGameBySlug, readGames } from '../../../../lib/local-games';
import { getGameCredits } from '../../../../lib/game-credits';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/** Read-only, public metadata for a game already in the library. */
export const GET: APIRoute = async ({ params }) => {
  try {
    const game = findGameBySlug(await readGames(), params.slug ?? '');
    if (!game) return json({ error: 'Juego no encontrado.' }, 404);
    const credits = await getGameCredits(game);
    return credits ? json(credits) : json({ error: 'Steam no ha devuelto los datos del juego.' }, 503);
  } catch {
    return json({ error: 'No se pudieron consultar los datos del juego.' }, 503);
  }
};
