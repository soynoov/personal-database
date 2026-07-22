/**
 * recap.ts — Lógica del "Wrapped" de /estadisticas/.
 *
 * Decisiones de negocio (tomadas con el usuario el 2026-06-30):
 *  - "Completados este año" usa fecha_fin ESTRICTA. Si fecha_fin está vacía,
 *    el juego no cuenta, aunque esté marcado "Terminado". Es la definición
 *    correcta a largo plazo, pero hoy mismo puede dar 0 si faltan datos.
 *  - "Horas" y "Gasto" del año usan fecha_inicio como PROXY de actividad,
 *    porque no existe un campo de fecha de compra en los juegos base.
 *    Es una aproximación: un juego que empezaste en 2026 cuenta entero
 *    en 2026 aunque sigas jugándolo en 2027.
 *  - Si falta precio_pagado, se usa precio_actual como estimación (excepto
 *    en juegos "Pirata", que se asumen gratis). Esas estimaciones se cuentan
 *    aparte para poder avisar en la UI.
 */
import type { LocalGame } from './local-games';
import { getPaidUnitPrice, getPurchasedUnits, slugifyGameTitle } from './local-games';
import { isCompletedStatus, normalizeStatus } from './game-status';

function isTerminado(estado: string | null | undefined) {
  return isCompletedStatus(estado);
}

function yearOf(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const y = Number(String(dateStr).slice(0, 4));
  return Number.isFinite(y) && y > 1990 && y < 2200 ? y : null;
}

function monthOf(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const m = Number(String(dateStr).slice(5, 7));
  return Number.isFinite(m) && m >= 1 && m <= 12 ? m : null;
}

export function getAvailableYears(games: LocalGame[]): number[] {
  const years = new Set<number>();
  years.add(new Date().getFullYear());
  for (const g of games) {
    const yi = yearOf(g.fecha_inicio);
    const yf = yearOf(g.fecha_fin);
    if (yi) years.add(yi);
    if (yf) years.add(yf);
  }
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
  gastoEstimadoCount: number;
  generosTop: Array<{ name: string; count: number; pct: number }>;
  launchersTop: Array<{ name: string; count: number; pct: number }>;
  monthly: MonthlyPoint[];
  juegoConMasHoras: RecapGameRef | null;
  promedioHorasPorJuego: number;
};

function toRef(g: LocalGame, precioAtribuido: number | null, precioEstimado: boolean): RecapGameRef {
  return {
    titulo: g.titulo,
    slug: slugifyGameTitle(g.titulo),
    horas: g.horas ?? null,
    fecha_inicio: g.fecha_inicio,
    fecha_fin: g.fecha_fin,
    launcher: g.launcher,
    generos: g.generos ?? null,
    precioAtribuido,
    precioEstimado,
  };
}

export function getYearRecap(games: LocalGame[], year: number): YearRecap {
  const completados = games
    .filter((g) => isTerminado(g.estado) && yearOf(g.fecha_fin) === year)
    .map((g) => toRef(g, null, false))
    .sort((a, b) => (b.fecha_fin ?? '').localeCompare(a.fecha_fin ?? ''));

  const iniciadosRaw = games.filter((g) => yearOf(g.fecha_inicio) === year);

  let horasAtribuidas = 0;
  let gastoAtribuido = 0;
  let gastoEstimadoCount = 0;
  const generoCounts = new Map<string, number>();
  const launcherCounts = new Map<string, number>();
  const monthly: MonthlyPoint[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, horas: 0 }));
  const iniciados: RecapGameRef[] = [];

  for (const g of iniciadosRaw) {
    const horas = Number(g.horas ?? 0);
    const horasValidas = Number.isFinite(horas) ? horas : 0;
    horasAtribuidas += horasValidas;

    const launcherLower = String(g.launcher ?? '').trim().toLowerCase();
    const esGratisOPirata = launcherLower === 'pirata';

    let precio: number | null = null;
    let estimado = false;
    if (g.precio_pagado !== null && g.precio_pagado !== undefined) {
      const unitPrice = getPaidUnitPrice(g);
      if (unitPrice !== null) {
        precio = Number((unitPrice * getPurchasedUnits(g)).toFixed(2));
      }
    } else if (!esGratisOPirata && g.precio_actual !== null && g.precio_actual !== undefined) {
      const currentPrice = Number(g.precio_actual);
      if (Number.isFinite(currentPrice)) {
        precio = Number((currentPrice * getPurchasedUnits(g)).toFixed(2));
      }
      estimado = true;
    }
    if (precio !== null && Number.isFinite(precio)) {
      gastoAtribuido += precio;
      if (estimado) gastoEstimadoCount++;
    }

    // Microtransacciones (compras dentro del juego, típico en free-to-play):
    // van aparte de precio_pagado, nunca se estiman, se suman tal cual si hay dato.
    const microtransacciones =
      g.gasto_microtransacciones !== null && g.gasto_microtransacciones !== undefined
        ? Number(g.gasto_microtransacciones)
        : 0;
    if (Number.isFinite(microtransacciones) && microtransacciones > 0) {
      gastoAtribuido += microtransacciones;
    }

    for (const genero of g.generos ?? []) {
      generoCounts.set(genero, (generoCounts.get(genero) ?? 0) + 1);
    }
    const launcherLabel = g.launcher ?? '(sin launcher)';
    launcherCounts.set(launcherLabel, (launcherCounts.get(launcherLabel) ?? 0) + 1);

    const mes = monthOf(g.fecha_inicio);
    if (mes) monthly[mes - 1].horas += horasValidas;

    const precioTotalGasto =
      precio !== null || microtransacciones > 0 ? (precio ?? 0) + microtransacciones : null;
    iniciados.push(toRef(g, precioTotalGasto, estimado));
  }

  const total = iniciadosRaw.length || 1;
  const generosTop = [...generoCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

  const launchersTop = [...launcherCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));

  const juegoConMasHoras = iniciados.length
    ? iniciados.reduce((max, g) => (Number(g.horas ?? 0) > Number(max.horas ?? 0) ? g : max))
    : null;

  return {
    year,
    completados,
    iniciados,
    horasAtribuidas: Number(horasAtribuidas.toFixed(1)),
    gastoAtribuido: Number(gastoAtribuido.toFixed(2)),
    gastoEstimadoCount,
    generosTop,
    launchersTop,
    monthly,
    juegoConMasHoras,
    promedioHorasPorJuego: iniciados.length ? Number((horasAtribuidas / iniciados.length).toFixed(1)) : 0,
  };
}

// Estados donde un campo vacío es esperado, no un hueco de datos.
const NO_EMPIEZA_AUN = new Set(['wishlist', 'pendiente']); // sin fecha_inicio es normal
const NO_ADQUIRIDO_AUN = new Set(['wishlist']); // sin precio_pagado es normal

function toGameRef(g: LocalGame) {
  return { titulo: g.titulo, slug: slugifyGameTitle(g.titulo) };
}

function sortByTitulo(list: Array<{ titulo: string; slug: string }>) {
  return [...list].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
}

export type DataQuality = {
  totalJuegos: number;
  totalTerminados: number;
  pctFechaFinCompleta: number;
  pctPrecioCompleto: number;
  gaps: {
    /** "Terminado" sin fecha_fin: bloquea que cuenten en "Completados" de cualquier año. */
    terminadosSinFecha: Array<{ titulo: string; slug: string }>;
    /** En curso/terminados sin fecha_inicio: no entran en horas/gasto/géneros/launchers de ningún año. */
    sinFechaInicio: Array<{ titulo: string; slug: string }>;
    /** Adquiridos sin precio_pagado: el gasto se estima o se queda fuera. */
    sinPrecio: Array<{ titulo: string; slug: string }>;
    /** Sin géneros: no aparecen en el desglose "Dónde se fue el año". */
    sinGeneros: Array<{ titulo: string; slug: string }>;
  };
};

export function getDataQuality(games: LocalGame[]): DataQuality {
  const terminados = games.filter((g) => isTerminado(g.estado));
  const terminadosSinFecha = terminados.filter((g) => !g.fecha_fin);

  const sinFechaInicio = games.filter(
    (g) => !g.fecha_inicio && !NO_EMPIEZA_AUN.has(normalizeStatus(g.estado)),
  );

  const sinPrecio = games.filter(
    (g) =>
      (g.precio_pagado === null || g.precio_pagado === undefined) &&
      !NO_ADQUIRIDO_AUN.has(normalizeStatus(g.estado)),
  );

  const sinGeneros = games.filter((g) => !g.generos || g.generos.length === 0);

  return {
    totalJuegos: games.length,
    totalTerminados: terminados.length,
    pctFechaFinCompleta: terminados.length
      ? Math.round(((terminados.length - terminadosSinFecha.length) / terminados.length) * 100)
      : 100,
    pctPrecioCompleto: games.length
      ? Math.round(((games.length - sinPrecio.length) / games.length) * 100)
      : 100,
    gaps: {
      terminadosSinFecha: sortByTitulo(terminadosSinFecha.map(toGameRef)),
      sinFechaInicio: sortByTitulo(sinFechaInicio.map(toGameRef)),
      sinPrecio: sortByTitulo(sinPrecio.map(toGameRef)),
      sinGeneros: sortByTitulo(sinGeneros.map(toGameRef)),
    },
  };
}
