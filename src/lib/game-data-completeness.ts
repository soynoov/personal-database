import { buildGameCoverUrl } from './game-cover-url';
import { isCompletedStatus, normalizeStatus } from './game-status';
import { hasGameTag } from './game-tags';
import type { LocalGame } from './local-games';
import { slugifyGameTitle } from './local-games';

export type DataEditor = 'status' | 'technical' | 'hours' | 'finance' | 'review';
export type DataGapCategory = 'copia' | 'actividad' | 'compra' | 'valoracion';

export type GameDataGap = {
  key: string;
  label: string;
  category: DataGapCategory;
  editor: DataEditor;
};

export type IncompleteGame = {
  titulo: string;
  slug: string;
  coverUrl: string;
  estado: string;
  missing: GameDataGap[];
  completedFields: number;
  applicableFields: number;
  completionPct: number;
};

export type DataCompleteness = {
  games: IncompleteGame[];
  totalGames: number;
  incompleteGames: number;
  totalMissing: number;
  completionPct: number;
};

const PLAYED_STATUSES = new Set([
  'jugando',
  'terminado',
  'completado',
  'pausado',
  'abandonado',
  'retirado',
  'recurrente',
]);

const ACQUIRED_STATUSES = new Set([
  'jugando',
  'terminado',
  'completado',
  'pendiente',
  'pausado',
  'abandonado',
  'retirado',
  'recurrente',
]);

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const hasNumber = (value: unknown) => value !== null && value !== undefined && Number.isFinite(Number(value));

function getGaps(game: LocalGame) {
  const status = normalizeStatus(game.estado);
  const gaps: GameDataGap[] = [];
  let applicableFields = 3;

  const add = (key: string, label: string, category: DataGapCategory, editor: DataEditor) => {
    gaps.push({ key, label, category, editor });
  };

  if (!hasText(game.estado)) add('estado', 'Estado', 'copia', 'status');
  if (!hasText(game.launcher)) add('launcher', 'Launcher', 'copia', 'technical');
  if (!hasText(game.plataforma)) add('plataforma', 'Plataforma', 'copia', 'technical');

  if (PLAYED_STATUSES.has(status)) {
    applicableFields += 2;
    if (!hasNumber(game.horas)) add('horas', 'Horas jugadas', 'actividad', 'hours');
    if (!hasText(game.fecha_inicio)) add('fecha_inicio', 'Fecha de inicio', 'actividad', 'hours');
  }

  if (isCompletedStatus(game.estado)) {
    applicableFields += 1;
    if (!hasText(game.fecha_fin)) add('fecha_fin', 'Fecha de fin', 'actividad', 'hours');
  }

  if (ACQUIRED_STATUSES.has(status) && !hasGameTag(game.tags, 'free-to-play')) {
    applicableFields += 1;
    if (!hasNumber(game.precio_pagado)) add('precio_pagado', 'Precio pagado', 'compra', 'finance');
  }

  if (isCompletedStatus(game.estado) || status === 'abandonado') {
    applicableFields += 1;
    if (!hasNumber(game.nota)) add('nota', 'Valoración personal', 'valoracion', 'review');
  }

  return { gaps, applicableFields };
}

export function getDataCompleteness(games: LocalGame[]): DataCompleteness {
  let totalApplicable = 0;
  let totalMissing = 0;

  const incomplete = games.flatMap((game) => {
    const { gaps, applicableFields } = getGaps(game);
    totalApplicable += applicableFields;
    totalMissing += gaps.length;
    if (gaps.length === 0) return [];

    return [{
      titulo: game.titulo,
      slug: slugifyGameTitle(game.titulo),
      coverUrl: buildGameCoverUrl(game),
      estado: game.estado?.trim() || 'Sin estado',
      missing: gaps,
      completedFields: applicableFields - gaps.length,
      applicableFields,
      completionPct: Math.round(((applicableFields - gaps.length) / applicableFields) * 100),
    }];
  });

  incomplete.sort((a, b) => {
    if (a.completionPct !== b.completionPct) return a.completionPct - b.completionPct;
    return a.titulo.localeCompare(b.titulo, 'es');
  });

  return {
    games: incomplete,
    totalGames: games.length,
    incompleteGames: incomplete.length,
    totalMissing,
    completionPct: totalApplicable ? Math.round(((totalApplicable - totalMissing) / totalApplicable) * 100) : 100,
  };
}
