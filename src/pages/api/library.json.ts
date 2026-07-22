import type { APIRoute } from "astro";
import { filterCatalogGames, getCatalogLimit, toCatalogGame } from "../../lib/catalog-game";
import { readGames } from "../../lib/local-games";

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("search") ?? "";
  const limit = getCatalogLimit(url.searchParams.get("limit"));
  const games = filterCatalogGames((await readGames()).map(toCatalogGame), { search }).slice(0, limit);

  return Response.json(games, {
    headers: { "Cache-Control": "private, no-store" },
  });
};
