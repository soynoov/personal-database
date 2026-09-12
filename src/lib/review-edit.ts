import { REVIEW_CRITERIA, type ReviewCriterionKey } from './review-criteria';
import type { GameCritique } from './review-types';

export function parseReviewV2(source: Record<string, unknown>, previous?: GameCritique | null):
  { ok: true; critique: GameCritique } | { ok: false; status: number; error: string } {
  if (source.base_revision !== undefined && source.base_revision !== JSON.stringify(previous ?? null)) {
    return { ok: false, status: 409, error: 'Esta valoración cambió en otra sesión. Conserva tu borrador y recarga la ficha antes de guardar.' };
  }
  const fail = (error: string) => ({ ok: false as const, status: 400, error });
  if (!source.criterios || typeof source.criterios !== 'object' || Array.isArray(source.criterios)) {
    return fail('Faltan las respuestas de la valoración.');
  }
  const input = source.criterios as Record<string, unknown>;
  const excluded = source.no_aplica ?? [];
  if (!Array.isArray(excluded) || excluded.some((key) => !REVIEW_CRITERIA.some((item) => item.key === key && item.optional))) {
    return fail('No aplica solo está disponible para las áreas opcionales.');
  }
  const criteria: NonNullable<GameCritique['criterios']> = {};
  for (const item of REVIEW_CRITERIA) {
    const raw = input[item.key];
    if (raw === null || raw === undefined || raw === '') {
      criteria[item.key] = null;
      continue;
    }
    if (typeof raw !== 'number' && typeof raw !== 'string') return fail(`Respuesta inválida en ${item.label}.`);
    const value = Number(raw);
    const preservedImport = previous?.criterios?.[item.key] === value;
    if (!Number.isFinite(value) || value < 0 || value > item.max || (!Number.isInteger(value) && !preservedImport)) {
      return fail(`${item.label} debe estar entre 0 y ${item.max}, usando una de sus opciones.`);
    }
    if (excluded.includes(item.key)) return fail(`${item.label} no puede tener una nota y No aplica a la vez.`);
    criteria[item.key] = value;
  }
  if (source.original !== undefined && source.original !== null && typeof source.original !== 'boolean') {
    return fail('Originalidad debe ser una insignia, no una puntuación.');
  }
  return {
    ok: true,
    critique: {
      ...previous, version: 2, criterios: criteria,
      original: source.original === undefined ? previous?.original ?? null : source.original as boolean | null,
      no_aplica: [...new Set(excluded)] as ReviewCriterionKey[],
    },
  };
}
