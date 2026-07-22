import type { APIRoute } from "astro";
import { filterCatalogGames, getCatalogLimit, toCatalogGame } from "../../lib/catalog-game";
import { readGames } from "../../lib/local-games";

export const GET: APIRoute = async ({ url }) => {
  const games = filterCatalogGames((await readGames()).map(toCatalogGame), {
    search: url.searchParams.get("search") ?? undefined,
    estado: url.searchParams.get("estado") ?? undefined,
    launcher: url.searchParams.get("launcher") ?? undefined,
    plataforma: url.searchParams.get("plataforma") ?? undefined,
  });

  const limit = getCatalogLimit(url.searchParams.get("limit"));

  return Response.json(games.slice(0, limit), {
    headers: { "Cache-Control": "private, no-store" },
  });
};
