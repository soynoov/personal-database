import { readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

export type LocalGame = {
  titulo: string;
  estado: string | null;
  launcher: string | null;
  plataforma: string | null;
  horas: number | null;
  steam_appid?: number | null;
  generos?: string[] | null;
  tags?: string[] | null;
  precio_pagado?: number | null;
  precio_actual?: number | null;
  precio_salida?: number | null;
  precio_minimo_historico?: number | null;
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
  steam_cromos?: {
    actual: number | null;
    total: number | null;
  } | null;
  nota?: number | null;
  comentarios?: string | null;
  lanzamiento?: number | null;
  solo?: string | null;
  cover_source?: string | null;
  steam_store_name?: string | null;
  steam_store_genres?: string[] | null;
  steam_last_sync_at?: string | null;
  hltb_match?: string | null;
  dlcs?: {
    total?: number | null;
    items?: Array<{
      titulo: string;
      cover_source?: string | null;
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

function containsText(value: unknown, search?: string | null) {
  if (!search) return true;
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(search.toLowerCase());
}

export async function readGames() {
  const raw = await readFile(gamesPath, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "");
  return JSON.parse(normalized) as LocalGame[];
}

export function slugifyGameTitle(title: string) {
  return String(title)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findGameBySlug(games: LocalGame[], slug: string) {
  return games.find((game) => slugifyGameTitle(game.titulo) === slug) ?? null;
}

export function filterGames(
  games: LocalGame[],
  filters: {
    search?: string | null;
    estado?: string | null;
    launcher?: string | null;
    plataforma?: string | null;
    solo?: string | null;
  } = {},
) {
  return games.filter((game) => {
    const searchMatches =
      containsText(game.titulo, filters.search) ||
      containsText(game.comentarios, filters.search) ||
      containsText(game.launcher, filters.search) ||
      containsText(game.generos?.join(", "), filters.search);

    return (
      searchMatches &&
      containsText(game.estado, filters.estado) &&
      containsText(game.launcher, filters.launcher) &&
      containsText(game.plataforma, filters.plataforma) &&
      (filters.solo ? String(game.solo ?? "") === filters.solo : true)
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

    if (estado === "Terminado") {
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
