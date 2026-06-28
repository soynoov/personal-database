import type { APIRoute } from "astro";
import { readGames } from "../../lib/local-games";

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("search") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 200);
  const games = (await readGames())
    .filter((game) => {
      if (!search) return true;
      return `${game.titulo} ${game.comentarios ?? ""}`.toLowerCase().includes(search.toLowerCase());
    })
    .slice(0, limit);

  return Response.json(games);
};
