import type { APIRoute } from "astro";
import { getStats, readGames } from "../../lib/local-games";

export const GET: APIRoute = async () => {
  return Response.json(getStats(await readGames()));
};
