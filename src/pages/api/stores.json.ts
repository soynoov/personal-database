import type { APIRoute } from "astro";
import { getUniqueValues, readGames } from "../../lib/local-games";

export const GET: APIRoute = async () => {
  const games = await readGames();
  const stores = getUniqueValues(games, 'launcher').map(nombre => ({ nombre }));

  return Response.json(stores);
};
