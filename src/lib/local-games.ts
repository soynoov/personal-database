import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { createGameBlobStore, hasGameBlobCredentials } from "./game-blob-store.mjs";
import { slugifyGameTitle, validateGameLibrary } from "./game-library.mjs";
export { GamesVersionConflictError, slugifyGameTitle } from "./game-library.mjs";
import { isCompletedStatus, normalizeStatus } from "./game-status";
import { gameHasMode, normalizeGameModes } from "./game-modes";
import { normalizeGameTag } from "./game-tags";
import historicGameCreationDates from "../data/game-created-at.json";

export type GameCritique = {
  metascore?: number | null;
  userscore?: number | null;
  criterios?: {
    jugabilidad?: number | null;
    historia?: number | null;
    musica?: number | null;
    graficos_arte?: number | null;
    entretenimiento?: number | null;
    originalidad?: number | null;
    comunidad?: number | null;
  } | null;
  mencion_honorifica?: {
    nivel?: number | null;
    comentario?: string | null;
  } | null;
};

export type LocalGame = {
  titulo: string;
  /** Primera fecha en la que la ficha quedó registrada en la web. */
  creado_en?: string | null;
  /** Última edición manual realizada desde la web. */
  actualizado_en?: string | null;
  estado: string | null;
  launcher: string | null;
  plataforma: string | null;
  horas: number | null;
  /** Indica que `horas` es una aproximación y no un registro del launcher. */
  horas_estimadas?: boolean | null;
  dificultad?: string | null;
  tamano?: string | null;
  steam_appid?: number | null;
  generos?: string[] | null;
  tags?: string[] | null;
  precio_pagado?: number | null;
  unidades_compradas?: number | null;
  tiendas_compra?: string[] | null;
  precio_actual?: number | null;
  precio_salida?: number | null;
  precio_minimo_historico?: number | null;
  /** Gasto en compras dentro del juego (microtransacciones), aparte de precio_pagado. Relevante sobre todo en free-to-play. */
  gasto_microtransacciones?: number | null;
  /** Rango competitivo actual, con el vocabulario propio del juego (p. ej. Oro 3 o 1850 MMR). */
  rango_actual?: string | null;
  /** Mejor rango competitivo alcanzado; se muestra como Peak ELO. */
  rango_maximo?: string | null;
  hltb?: number | null;
  hltb_breakdown?: {
    main?: number | null;
    main_plus?: number | null;
    completionist?: number | null;
  } | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  logros?: {
    actual: number | null;
    total: number | null;
  } | null;
  /** Número de partidas completadas al 100 %, independiente de los logros. */
  partidas_al_100?: number | null;
  steam_cromos?: {
    actual: number | null;
    total: number | null;
  } | null;
  nota?: number | null;
  critica?: GameCritique | null;
  comentarios?: string | null;
  lanzamiento?: number | null;
  modos?: string[] | null;
  solo?: boolean | null;
  cover_source?: string | null;
  cover_url?: string | null;
  steam_store_name?: string | null;
  steam_store_genres?: string[] | null;
  steam_last_sync_at?: string | null;
  hltb_match?: string | null;
  dlcs?: {
    total?: number | null;
    items?: Array<{
      titulo: string;
      cover_source?: string | null;
      cover_url?: string | null;
      steam_appid?: number | null;
      fecha_adquisicion?: string | null;
      precio_pagado?: number | null;
      precio_actual?: number | null;
      precio_salida?: number | null;
      tamano?: string | null;
      notas?: string | null;
    }> | null;
  } | null;
};

const localGamesPath = path.resolve(process.cwd(), "games.json");
const parentGamesPath = path.resolve(process.cwd(), "..", "games.json");
const gamesPath = existsSync(localGamesPath) ? localGamesPath : parentGamesPath;
const gameBlobStore = createGameBlobStore();
const gamesVersions = new WeakMap<LocalGame[], string | null>();
const historicCreationByTitle = historicGameCreationDates as Record<string, string>;

function applyGameDataMigrations(games: LocalGame[]) {
  return games.map((game) => {
    const rawTags = Array.isArray(game.tags) ? game.tags : [];
    const hadLegacyStreamingTag = rawTags.some((tag) => {
      const normalized = normalizeGameTag(tag);
      return normalized === 'transmitir' || normalized === 'transmision';
    });
    const tags = hadLegacyStreamingTag
      ? rawTags.filter((tag) => {
          const normalized = normalizeGameTag(tag);
          return normalized !== 'transmitir' && normalized !== 'transmision';
        })
      : game.tags;
    const modos = hadLegacyStreamingTag
      ? normalizeGameModes([...(game.modos ?? []), 'transmision'])
      : game.modos;
    const migratedGame = {
      ...game,
      creado_en: game.creado_en ?? historicCreationByTitle[game.titulo] ?? null,
      ...(hadLegacyStreamingTag ? { tags, modos } : {}),
    };

    if (game.titulo !== "Mini Airways") {
      return migratedGame;
    }

    return {
      ...migratedGame,
      modos,
      steam_appid: 2289650,
      tags: (tags ?? []).filter(
        (tag) => String(tag).trim().toLowerCase() !== "free-to-play",
      ),
    };
  });
}

export function hasProductionGameStorage() {
  return hasGameBlobCredentials();
}

export async function readBundledGames() {
  const raw = await readFile(gamesPath, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "");
  return applyGameDataMigrations(validateGameLibrary(JSON.parse(normalized), 'games.json') as LocalGame[]);
}

function containsText(value: unknown, search?: string | null) {
  if (!search) return true;
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(search.toLowerCase());
}

export async function readGames() {
  if (!process.env.VERCEL || !hasProductionGameStorage()) {
    return readBundledGames();
  }

  const result = await gameBlobStore.read();

  if (!result) {
    const bundledGames = await readBundledGames();
    gamesVersions.set(bundledGames, null);
    return bundledGames;
  }

  const games = applyGameDataMigrations(result.games as LocalGame[]);
  gamesVersions.set(games, result.etag);
  return games;
}

/**
 * En local conserva games.json como fuente canónica. En Vercel escribe una
 * copia privada persistente en Blob; la primera escritura parte del JSON
 * incluido en el deploy. El ETag evita pisar cambios concurrentes.
 */
export async function writeGames(games: LocalGame[]) {
  validateGameLibrary(games);
  const json = `${JSON.stringify(games, null, 2)}\n`;

  if (!process.env.VERCEL) {
    await writeFile(gamesPath, json, "utf8");
    return;
  }

  if (!hasProductionGameStorage()) {
    throw new Error(
      "Falta conectar un almacén privado de Vercel Blob al proyecto.",
    );
  }

  const previousEtag = gamesVersions.get(games);

  gamesVersions.set(games, await gameBlobStore.write(games, previousEtag));
}

export function findGameBySlug(games: LocalGame[], slug: string) {
  return games.find((game) => slugifyGameTitle(game.titulo) === slug) ?? null;
}

export function getPurchasedUnits(game: Pick<LocalGame, "unidades_compradas">) {
  const units = Number(game.unidades_compradas ?? 1);
  if (!Number.isFinite(units) || units < 1) return 1;
  return Math.max(1, Math.round(units));
}

export function getPaidUnitPrice(game: Pick<LocalGame, "precio_pagado">) {
  if (game.precio_pagado === null || game.precio_pagado === undefined) return null;
  const price = Number(game.precio_pagado);
  return Number.isFinite(price) ? price : null;
}

export function getTotalPaidPrice(
  game: Pick<LocalGame, "precio_pagado" | "unidades_compradas">,
) {
  const unitPrice = getPaidUnitPrice(game);
  if (unitPrice === null) return null;
  return Number((unitPrice * getPurchasedUnits(game)).toFixed(2));
}

export function filterGames(
  games: LocalGame[],
  filters: {
    search?: string | null;
    estado?: string | null;
    launcher?: string | null;
    plataforma?: string | null;
    modo?: string | null;
    solo?: string | null;
  } = {},
) {
  const matchesSoloFilter = (value: boolean | null | undefined, filter?: string | null) => {
    if (!filter) return true;
    if (filter === "true") return value === true;
    if (filter === "false") return value === false;
    return false;
  };

  return games.filter((game) => {
    const searchMatches =
      containsText(game.titulo, filters.search) ||
      containsText(game.comentarios, filters.search) ||
      containsText(game.launcher, filters.search) ||
      containsText(game.generos?.join(", "), filters.search);

    return (
      searchMatches &&
      (!filters.estado ||
        (isCompletedStatus(filters.estado)
          ? isCompletedStatus(game.estado)
          : normalizeStatus(game.estado) === normalizeStatus(filters.estado))) &&
      containsText(game.launcher, filters.launcher) &&
      containsText(game.plataforma, filters.plataforma) &&
      (!filters.modo || gameHasMode(game, filters.modo)) &&
      matchesSoloFilter(game.solo, filters.solo)
    );
  });
}

export function getUniqueValues(games: LocalGame[], key: keyof LocalGame) {
  return [...new Set(games.map((game) => game[key]).filter(Boolean).map(String))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export function getStats(games: LocalGame[]) {
  const estados = new Map<string, number>();
  const launchers = new Map<string, number>();
  let horas = 0;
  let terminados = 0;

  for (const game of games) {
    const estado = game.estado ?? "(sin estado)";
    const launcher = game.launcher ?? "(sin launcher)";

    estados.set(estado, (estados.get(estado) ?? 0) + 1);
    launchers.set(launcher, (launchers.get(launcher) ?? 0) + 1);
    horas += Number(game.horas ?? 0);

    if (isCompletedStatus(estado)) {
      terminados++;
    }
  }

  return {
    total: games.length,
    horas: Number(horas.toFixed(1)),
    terminados,
    estados: Object.fromEntries([...estados.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"))),
    launchers: Object.fromEntries(
      [...launchers.entries()].sort((a, b) => a[0].localeCompare(b[0], "es")),
    ),
  };
}
