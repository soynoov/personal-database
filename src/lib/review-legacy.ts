import type { LegacyCritique } from './review-types';

export function boundedReviewNumber(value: unknown, max: number): number | null {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : null;
}

/** Solo compatibilidad y archivo. No se utiliza para nuevas valoraciones v2. */
export function calculateLegacyReview(critique: LegacyCritique | null | undefined, community = false) {
  const definitions = [
    ['jugabilidad', 5, 1], ['historia', 5, 1], ['musica', 3, 1],
    ['graficos_arte', 5, 1], ['entretenimiento', 5, 1], ['originalidad', 1, 1],
    ...(community ? [['comunidad', 5, 0.5]] : []),
  ] as Array<[keyof NonNullable<LegacyCritique['criterios']>, number, number]>;
  let earnedPoints = 0;
  let possiblePoints = 0;
  for (const [key, max, weight] of definitions) {
    const value = boundedReviewNumber(critique?.criterios?.[key], max);
    if (value === null) {
      if (key === 'originalidad') continue;
      return null;
    }
    earnedPoints += value * weight;
    possiblePoints += max * weight;
  }
  const raw = earnedPoints / possiblePoints * 10;
  const honoraryBonus = Number(((boundedReviewNumber(critique?.mencion_honorifica?.nivel, 3) ?? 0) * 0.1).toFixed(1));
  return {
    earnedPoints, possiblePoints, baseScore: Number(raw.toFixed(1)), honoraryBonus,
    finalScore: Number(Math.min(10, raw + honoraryBonus).toFixed(1)),
  };
}
