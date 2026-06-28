import type { APIRoute } from "astro";
import { filterGames, readGames } from "../../lib/local-games";

export const GET: APIRoute = async ({ url }) => {
  const games = filterGames(await readGames(), {
    search: url.searchParams.get("search") ?? undefined,
    estado: url.searchParams.get("estado") ?? undefined,
    launcher: url.searchParams.get("launcher") ?? undefined,
    plataforma: url.searchParams.get("plataforma") ?? undefined,
  });

  const limit = Number(url.searchParams.get("limit") ?? 200);

  return Response.json(games.slice(0, limit));
};
