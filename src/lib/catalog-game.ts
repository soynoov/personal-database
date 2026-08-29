import type { LocalGame } from "./local-games";
import { slugifyGameTitle } from "./local-games";
import { isCompletedStatus, normalizeStatus } from "./game-status";
import { getGameTagLabel, hasGameTag, normalizeGameTag } from "./game-tags";
import { gameHasMode } from "./game-modes";
import { getGameGenres } from "./game-genres";
import {
  getGameProfitabilityStatus,
  type GameProfitabilityStatus,
} from "./game-finance";

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
  | "modos"
  | "solo"
  | "steam_appid"
  | "cover_url"
  | "logros"
> & {
  slug: string;
  amortizado: boolean;
  rentabilidad: GameProfitabilityStatus;
};

export function toCatalogGame(game: LocalGame): CatalogGame {
  const rentabilidad = getGameProfitabilityStatus(game);

  return {
    slug: slugifyGameTitle(game.titulo),
    amortizado: rentabilidad === 'amortized',
    rentabilidad,
    titulo: game.titulo,
    estado: game.estado,
    launcher: game.launcher,
    plataforma: game.plataforma,
    horas: game.horas,
    generos: getGameGenres(game.generos),
    tags: game.tags,
    precio_pagado: game.precio_pagado,
    precio_actual: game.precio_actual,
    precio_salida: game.precio_salida,
    lanzamiento: game.lanzamiento,
    modos: game.modos,
    solo: game.solo,
    steam_appid: game.steam_appid,
    cover_url: game.cover_url,
    logros: game.logros,
  };
}

type CatalogFilters = {
  search?: string | null;
  estado?: string | null;
  launcher?: string | null;
  plataforma?: string | null;
  tag?: string | null;
  modo?: string | null;
};

const containsText = (value: unknown, search?: string | null): boolean => {
  if (!search) return true;
  return String(value ?? "").toLowerCase().includes(search.toLowerCase());
};

const matchesTag = (game: CatalogGame, tag?: string | null): boolean => {
  if (!tag) return true;
  if (hasGameTag(game.tags, tag)) return true;
  if (normalizeGameTag(tag) !== "early-access") return false;
  return Boolean(
    game.generos?.some((genre) => {
      const normalized = normalizeGameTag(genre);
      return normalized === "early-access" || normalized === "acceso-anticipado";
    }),
  );
};

export function filterCatalogGames(games: CatalogGame[], filters: CatalogFilters = {}) {
  return games.filter((game) => {
    const searchMatches =
      containsText(game.titulo, filters.search) ||
      containsText(game.launcher, filters.search) ||
      containsText(game.generos?.join(", "), filters.search) ||
      containsText(game.tags?.map(getGameTagLabel).join(", "), filters.search);

    return (
      searchMatches &&
      (!filters.estado ||
        (isCompletedStatus(filters.estado)
          ? isCompletedStatus(game.estado)
          : normalizeStatus(game.estado) === normalizeStatus(filters.estado))) &&
      containsText(game.launcher, filters.launcher) &&
      containsText(game.plataforma, filters.plataforma) &&
      matchesTag(game, filters.tag) &&
      (!filters.modo || gameHasMode(game, filters.modo))
    );
  });
}

export function getCatalogLimit(value: string | null, fallback = 200): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(200, Math.trunc(parsed))) : fallback;
}
