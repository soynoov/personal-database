import type { LocalGame } from "./local-games";
import { slugifyGameTitle } from "./local-games";
import { isCompletedStatus, normalizeStatus } from "./game-status";

export type CatalogGame = Pick<
  LocalGame,
  | "titulo"
  | "estado"
  | "launcher"
  | "plataforma"
  | "horas"
  | "generos"
  | "tags"
  | "precio_pagado"
  | "precio_actual"
  | "precio_salida"
  | "lanzamiento"
  | "solo"
  | "steam_appid"
  | "cover_url"
> & {
  slug: string;
};

export function toCatalogGame(game: LocalGame): CatalogGame {
  return {
    slug: slugifyGameTitle(game.titulo),
    titulo: game.titulo,
    estado: game.estado,
    launcher: game.launcher,
    plataforma: game.plataforma,
    horas: game.horas,
    generos: game.generos,
    tags: game.tags,
    precio_pagado: game.precio_pagado,
    precio_actual: game.precio_actual,
    precio_salida: game.precio_salida,
    lanzamiento: game.lanzamiento,
    solo: game.solo,
    steam_appid: game.steam_appid,
    cover_url: game.cover_url,
  };
}

type CatalogFilters = {
  search?: string | null;
  estado?: string | null;
  launcher?: string | null;
  plataforma?: string | null;
};

const containsText = (value: unknown, search?: string | null): boolean => {
  if (!search) return true;
  return String(value ?? "").toLowerCase().includes(search.toLowerCase());
};

export function filterCatalogGames(games: CatalogGame[], filters: CatalogFilters = {}) {
  return games.filter((game) => {
    const searchMatches =
      containsText(game.titulo, filters.search) ||
      containsText(game.launcher, filters.search) ||
      containsText(game.generos?.join(", "), filters.search);

    return (
      searchMatches &&
      (!filters.estado ||
        (isCompletedStatus(filters.estado)
          ? isCompletedStatus(game.estado)
          : normalizeStatus(game.estado) === normalizeStatus(filters.estado))) &&
      containsText(game.launcher, filters.launcher) &&
      containsText(game.plataforma, filters.plataforma)
    );
  });
}

export function getCatalogLimit(value: string | null, fallback = 200): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(200, Math.trunc(parsed))) : fallback;
}
