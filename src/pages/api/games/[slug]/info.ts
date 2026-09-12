import type { APIRoute } from 'astro';
import { findGameBySlug, readGames } from '../../../../lib/local-games';
import { getSteamGameCredits, isSteamAppId } from '../../../../lib/steam-game-credits';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

/** Read-only, public metadata for a game already in the library. */
export const GET: APIRoute = async ({ params }) => {
  try {
    const game = findGameBySlug(await readGames(), params.slug ?? '');
    if (!game) return json({ error: 'Juego no encontrado.' }, 404);
    if (!isSteamAppId(game.steam_appid)) return json({ developers: [], publishers: [] });
    const credits = await getSteamGameCredits(game.steam_appid);
    return credits ? json(credits) : json({ error: 'Steam no ha devuelto los datos del juego.' }, 503);
  } catch {
    return json({ error: 'No se pudieron consultar los datos del juego.' }, 503);
  }
};
