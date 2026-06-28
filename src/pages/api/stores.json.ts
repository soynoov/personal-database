import type { APIRoute } from "astro";
import { readGames } from "../../lib/local-games";

export const GET: APIRoute = async () => {
  const games = await readGames();
  const stores = [...new Set(games.map((game) => game.launcher).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "es"))
    .map((nombre) => ({ nombre }));

  return Response.json(stores);
};
