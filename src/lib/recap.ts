import type { LocalGame } from './local-games';
import { slugifyGameTitle } from './local-games';
import { isCompletedStatus, normalizeStatus } from './game-status';
import { getGameGenres } from './game-genres';
import {
  getGameValueMetrics,
  getRecordedBaseSpend,
  getRecordedMicrotransactionSpend,
  isAcquiredDlc,
} from './game-finance';

const yearOf = (date: string | null | undefined): number | null => {
  if (!date) return null;
  const year = Number(String(date).slice(0, 4));
  return Number.isFinite(year) && year > 1990 && year < 2200 ? year : null;
};

const monthOf = (date: string | null | undefined): number | null => {
  if (!date) return null;
  const month = Number(String(date).slice(5, 7));
  return Number.isFinite(month) && month >= 1 && month <= 12 ? month : null;
};

export function getAvailableYears(games: LocalGame[]): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  games.forEach((game) => {
    [yearOf(game.fecha_inicio), yearOf(game.fecha_fin)].forEach((year) => year && years.add(year));
    (game.dlcs?.items ?? []).forEach((dlc) => {
      const year = yearOf(dlc.fecha_adquisicion);
      if (year) years.add(year);
    });
  });
  return [...years].sort((a, b) => b - a);
}

export type RecapGameRef = {
  titulo: string;
  slug: string;
  horas: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  launcher: string | null;
  generos: string[] | null;
  precioAtribuido: number | null;
  precioEstimado: boolean;
};

export type MonthlyPoint = { month: number; horas: number };

export type YearRecap = {
  year: number;
  completados: RecapGameRef[];
  iniciados: RecapGameRef[];
  horasAtribuidas: number;
  gastoAtribuido: number;
  gastoIncompletoCount: number;
  generosTop: Array<{ name: string; count: number; pct: number }>;
  launchersTop: Array<{ name: string; count: number; pct: number }>;
  monthly: MonthlyPoint[];
  juegoConMasHoras: RecapGameRef | null;
  promedioHorasPorJuego: number;
};

const toRef = (game: LocalGame, precioAtribuido: number | null): RecapGameRef => ({
  titulo: game.titulo,
  slug: slugifyGameTitle(game.titulo),
  horas: game.horas ?? null,
  fecha_inicio: game.fecha_inicio,
  fecha_fin: game.fecha_fin,
  launcher: game.launcher,
  generos: getGameGenres(game.generos),
  precioAtribuido,
  precioEstimado: false,
});

export function getYearRecap(games: LocalGame[], year: number): YearRecap {
  const completados = games
    .filter((game) => isCompletedStatus(game.estado) && yearOf(game.fecha_fin) === year)
    .map((game) => toRef(game, null))
    .sort((a, b) => (b.fecha_fin ?? '').localeCompare(a.fecha_fin ?? ''));
  const iniciadosRaw = games.filter((game) => yearOf(game.fecha_inicio) === year);
  const monthly: MonthlyPoint[] = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, horas: 0 }));
  const genreCounts = new Map<string, number>();
  const launcherCounts = new Map<string, number>();
  const iniciados: RecapGameRef[] = [];
  let horasAtribuidas = 0;

  iniciadosRaw.forEach((game) => {
    const hours = Number(game.horas ?? 0);
    const validHours = Number.isFinite(hours) ? hours : 0;
    horasAtribuidas += validHours;
    const month = monthOf(game.fecha_inicio);
    if (month) monthly[month - 1].horas += validHours;
    getGameGenres(game.generos).forEach((genre) => genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1));
    const launcher = game.launcher ?? '(sin launcher)';
    launcherCounts.set(launcher, (launcherCounts.get(launcher) ?? 0) + 1);
    const base = getRecordedBaseSpend(game);
    const micro = getRecordedMicrotransactionSpend(game);
    iniciados.push(toRef(game, base === null && micro === 0 ? null : (base ?? 0) + micro));
  });

  let gastoAtribuido = 0;
  let gastoIncompletoCount = 0;
  games.forEach((game) => {
    if (yearOf(game.fecha_inicio) === year) {
      const base = getRecordedBaseSpend(game);
      if (base === null) gastoIncompletoCount += 1;
      else gastoAtribuido += base;
      gastoAtribuido += getRecordedMicrotransactionSpend(game);
    }

    (game.dlcs?.items ?? []).filter(isAcquiredDlc).forEach((dlc) => {
      if (yearOf(dlc.fecha_adquisicion) !== year) return;
      const paid = dlc.precio_pagado === null || dlc.precio_pagado === undefined
        ? null
        : Number(dlc.precio_pagado);
      if (paid === null || !Number.isFinite(paid) || paid < 0) gastoIncompletoCount += 1;
      else gastoAtribuido += paid;
    });
  });

  const total = iniciadosRaw.length || 1;
  const generosTop = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, pct: Math.round(count / total * 100) }));
  const launchersTop = [...launcherCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round(count / total * 100) }));
  const juegoConMasHoras = iniciados.length
    ? iniciados.reduce((max, game) => Number(game.horas ?? 0) > Number(max.horas ?? 0) ? game : max)
    : null;

  return {
    year,
    completados,
    iniciados,
    horasAtribuidas: Number(horasAtribuidas.toFixed(1)),
    gastoAtribuido: Number(gastoAtribuido.toFixed(2)),
    gastoIncompletoCount,
    generosTop,
    launchersTop,
    monthly,
    juegoConMasHoras,
    promedioHorasPorJuego: iniciados.length ? Number((horasAtribuidas / iniciados.length).toFixed(1)) : 0,
  };
}

const NO_START_EXPECTED = new Set(['wishlist', 'pendiente']);
const NO_PRICE_EXPECTED = new Set(['wishlist']);
const toGameRef = (game: LocalGame) => ({ titulo: game.titulo, slug: slugifyGameTitle(game.titulo) });
const sortByTitle = (list: Array<{ titulo: string; slug: string }>) =>
  [...list].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));

export type DataQuality = {
  totalJuegos: number;
  totalTerminados: number;
  pctFechaFinCompleta: number;
  pctPrecioCompleto: number;
  gaps: {
    terminadosSinFecha: Array<{ titulo: string; slug: string }>;
    sinFechaInicio: Array<{ titulo: string; slug: string }>;
    sinPrecio: Array<{ titulo: string; slug: string }>;
    sinGeneros: Array<{ titulo: string; slug: string }>;
  };
};

export function getDataQuality(games: LocalGame[]): DataQuality {
  const completed = games.filter((game) => isCompletedStatus(game.estado));
  const terminadosSinFecha = completed.filter((game) => !game.fecha_fin);
  const sinFechaInicio = games.filter(
    (game) => !game.fecha_inicio && !NO_START_EXPECTED.has(normalizeStatus(game.estado)),
  );
  const sinPrecio = games.filter(
    (game) => !NO_PRICE_EXPECTED.has(normalizeStatus(game.estado)) && !getGameValueMetrics(game).dataComplete,
  );
  const sinGeneros = games.filter((game) => getGameGenres(game.generos).length === 0);

  return {
    totalJuegos: games.length,
    totalTerminados: completed.length,
    pctFechaFinCompleta: completed.length
      ? Math.round((completed.length - terminadosSinFecha.length) / completed.length * 100)
      : 100,
    pctPrecioCompleto: games.length
      ? Math.round((games.length - sinPrecio.length) / games.length * 100)
      : 100,
    gaps: {
      terminadosSinFecha: sortByTitle(terminadosSinFecha.map(toGameRef)),
      sinFechaInicio: sortByTitle(sinFechaInicio.map(toGameRef)),
      sinPrecio: sortByTitle(sinPrecio.map(toGameRef)),
      sinGeneros: sortByTitle(sinGeneros.map(toGameRef)),
    },
  };
}
