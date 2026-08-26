import { getLegacySoloValue, normalizeGameModes } from './game-modes';
import { calculatePersonalScore, isCommunityCriterionApplicable } from './game-reviews';
import { getGameGenres } from './game-genres';
import type { GameCritique, LocalGame } from './local-games';

type PatchError = { ok: false; status: number; error: string };
type PatchSuccess = { ok: true; game: LocalGame };

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBoundedNumber = (value: unknown, min: number, max: number) => {
  const parsed = toNullableNumber(value);
  return parsed !== null && parsed >= min && parsed <= max ? parsed : null;
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
};

const toNullableBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
};

const toNullablePositiveInteger = (value: unknown) => {
  const parsed = toNullableNumber(value);
  return parsed !== null && parsed >= 1 ? Math.round(parsed) : null;
};

const toNullableNonNegativeInteger = (value: unknown) => {
  const parsed = toNullableNumber(value);
  return parsed !== null && parsed >= 0 ? Math.round(parsed) : null;
};

const toStringArray = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
};

function toGameCritique(value: unknown): GameCritique {
  const source = typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {};
  const criteria = typeof source.criterios === 'object' && source.criterios !== null
    ? source.criterios as Record<string, unknown>
    : {};
  const honorary = typeof source.mencion_honorifica === 'object' && source.mencion_honorifica !== null
    ? source.mencion_honorifica as Record<string, unknown>
    : {};

  return {
    metascore: toBoundedNumber(source.metascore, 0, 100),
    userscore: toBoundedNumber(source.userscore, 0, 10),
    criterios: {
      jugabilidad: toBoundedNumber(criteria.jugabilidad, 1, 5),
      historia: toBoundedNumber(criteria.historia, 1, 5),
      musica: toBoundedNumber(criteria.musica, 1, 3),
      graficos_arte: toBoundedNumber(criteria.graficos_arte, 1, 5),
      entretenimiento: toBoundedNumber(criteria.entretenimiento, 1, 5),
      originalidad: toBoundedNumber(criteria.originalidad, 0, 1),
      comunidad: toBoundedNumber(criteria.comunidad, 1, 5),
    },
    mencion_honorifica: {
      nivel: toBoundedNumber(honorary.nivel, 0, 3),
      comentario: toNullableString(honorary.comentario),
    },
  };
}

const toggleTag = (
  tags: string[] | null | undefined,
  tag: string,
  enabled: unknown,
) => {
  const normalized = tag.toLowerCase();
  const remaining = (tags ?? []).filter((item) => String(item).trim().toLowerCase() !== normalized);
  return enabled === true ? [...remaining, tag] : remaining;
};

export function applyManualGamePatch(
  game: LocalGame,
  body: Record<string, unknown>,
): PatchError | PatchSuccess {
  const updated: LocalGame = { ...game };

  if (body.estado !== undefined) updated.estado = toNullableString(body.estado) ?? game.estado;
  if (body.horas !== undefined) updated.horas = toNullableNumber(body.horas);
  if (body.dificultad !== undefined) updated.dificultad = toNullableString(body.dificultad);
  if (body.fecha_inicio !== undefined) updated.fecha_inicio = toNullableString(body.fecha_inicio);
  if (body.fecha_fin !== undefined) updated.fecha_fin = toNullableString(body.fecha_fin);
  if (body.solo !== undefined) updated.solo = toNullableBoolean(body.solo);
  if (body.modos !== undefined) {
    updated.modos = normalizeGameModes(body.modos);
    updated.solo = getLegacySoloValue(updated.modos);
  }
  if (body.generos !== undefined) updated.generos = getGameGenres(toStringArray(body.generos));
  if (body.precio_pagado !== undefined) updated.precio_pagado = toNullableNumber(body.precio_pagado);
  if (body.unidades_compradas !== undefined) {
    updated.unidades_compradas = toNullablePositiveInteger(body.unidades_compradas);
  }
  if (body.tiendas_compra !== undefined) updated.tiendas_compra = toStringArray(body.tiendas_compra);
  if (body.gasto_microtransacciones !== undefined) {
    updated.gasto_microtransacciones = toNullableNumber(body.gasto_microtransacciones);
  }
  if (body.rango_actual !== undefined) updated.rango_actual = toNullableString(body.rango_actual);
  if (body.rango_maximo !== undefined) updated.rango_maximo = toNullableString(body.rango_maximo);
  if (body.comentarios !== undefined) updated.comentarios = toNullableString(body.comentarios);

  if (body.logros_actual !== undefined || body.logros_total !== undefined) {
    const actual = body.logros_actual !== undefined
      ? toNullableNonNegativeInteger(body.logros_actual)
      : game.logros?.actual ?? null;
    const total = body.logros_total !== undefined
      ? toNullableNonNegativeInteger(body.logros_total)
      : game.logros?.total ?? null;
    if (actual !== null && total !== null && actual > total) {
      return { ok: false, status: 400, error: 'Los logros conseguidos no pueden superar el total.' };
    }
    updated.logros = actual === null && total === null ? null : { actual, total };
  }

  if (body.critica !== undefined) {
    updated.critica = toGameCritique(body.critica);
    const honorary = updated.critica.mencion_honorifica;
    if ((honorary?.nivel ?? 0) > 0 && !honorary?.comentario) {
      return { ok: false, status: 400, error: 'Explica el motivo de la mención honorífica.' };
    }
    updated.nota = calculatePersonalScore(
      updated.critica,
      isCommunityCriterionApplicable(updated),
    );
  }

  let nextTags = body.tags !== undefined ? toStringArray(body.tags) : game.tags;
  if (body.free_to_play !== undefined) {
    nextTags = toggleTag(nextTags, 'free-to-play', body.free_to_play);
  }
  if (body.competitivo !== undefined) {
    nextTags = toggleTag(nextTags, 'competitivo', body.competitivo);
  }
  if (body.cooperativo_privado !== undefined) {
    nextTags = toggleTag(nextTags, 'cooperativo-privado', body.cooperativo_privado);
  }
  if (body.modos !== undefined) nextTags = toggleTag(nextTags, 'cooperativo-privado', false);
  if (
    body.tags !== undefined ||
    body.free_to_play !== undefined ||
    body.competitivo !== undefined ||
    body.cooperativo_privado !== undefined ||
    body.modos !== undefined
  ) {
    updated.tags = nextTags;
  }

  updated.actualizado_en = new Date().toISOString();
  return { ok: true, game: updated };
}
