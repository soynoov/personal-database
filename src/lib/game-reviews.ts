import type { GameCritique, LocalGame } from './local-games';
import { getGameModes } from './game-modes';
import { REVIEW_CRITERIA, OVERALL_SCORE_SCALE, type ReviewCriterionDefinition } from './review-criteria';
import { boundedReviewNumber, calculateLegacyReview } from './review-legacy';
export { REVIEW_CRITERIA, OVERALL_SCORE_SCALE, REVIEW_STEPS } from './review-criteria';
export type { ReviewCriterionKey, ReviewCriterionDefinition } from './review-criteria';

export function isCommunityCriterionApplicable(
  game: Pick<LocalGame, 'modos' | 'solo' | 'tags' | 'generos' | 'rango_actual' | 'rango_maximo'>,
) {
  const tags = (game.tags ?? []).map((tag) => String(tag).trim().toLowerCase());
  const genres = (game.generos ?? []).map((genre) => String(genre).trim().toLowerCase());
  const modes = getGameModes(game);
  if (tags.includes('competitivo') || game.rango_actual || game.rango_maximo) return true;
  if (modes.includes('multijugador')) return true;
  if (modes.includes('cooperativo')) return false;
  return genres.some((genre) => genre.includes('multijugador') || genre.includes('multiplayer'));
}

export type ReviewCriterionScore = ReviewCriterionDefinition & {
  value: number | null;
  normalized: number | null;
  description: string | null;
  notApplicable: boolean;
};

export function getReviewCriterionScores(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): ReviewCriterionScore[] {
  return REVIEW_CRITERIA.filter((item) => includeCommunity || item.key !== 'comunidad').map((item) => {
    const notApplicable = item.optional && (critique?.no_aplica ?? []).includes(item.key);
    const value = notApplicable ? null : boundedReviewNumber(critique?.criterios?.[item.key], item.max);
    return {
      ...item, value, notApplicable,
      normalized: value === null ? null : value / item.max * 10,
      description: value === null ? null : item.scale[value] ?? 'Valor importado del sistema anterior.',
    };
  });
}

export function getReviewProgress(critique: GameCritique | null | undefined, includeCommunity = false) {
  const criteria = getReviewCriterionScores(critique, includeCommunity);
  const applicable = criteria.filter((item) => !item.notApplicable);
  const answered = applicable.filter((item) => item.value !== null);
  const missing = applicable.filter((item) => item.value === null);
  return { criteria, applicable, answered, missing, complete: missing.length === 0 && applicable.length > 0 };
}

export type PersonalScoreCalculation = {
  earnedPoints: number;
  possiblePoints: number;
  baseScore: number;
  honoraryBonus: number;
  finalScore: number;
};

/** V2: media de áreas normalizadas, sin bonus. Desconocido != cero != no aplica. */
export function getPersonalScoreCalculation(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): PersonalScoreCalculation | null {
  if (critique?.version !== 2) return calculateLegacyReview(critique, includeCommunity);
  const { applicable, complete } = getReviewProgress(critique, includeCommunity);
  if (!complete) return null;
  const possiblePoints = applicable.reduce((sum, item) => sum + item.weight, 0);
  const earnedPoints = applicable.reduce((sum, item) => sum + item.value! / item.max * item.weight, 0);
  const raw = earnedPoints / possiblePoints * 10;
  // Un 9,95 no se convierte en un 10: el máximo exige todas las áreas al máximo.
  const perfect = applicable.every((item) => item.value === item.max);
  const finalScore = perfect ? 10 : Math.min(9.9, Number(raw.toFixed(1)));
  return { earnedPoints, possiblePoints, baseScore: finalScore, honoraryBonus: 0, finalScore };
}

export function calculatePersonalScore(critique: GameCritique | null | undefined, includeCommunity = false) {
  return getPersonalScoreCalculation(critique, includeCommunity)?.finalScore ?? null;
}

/** Conserva la nota publicada durante la migración; nunca publica una media incompleta. */
export function getPublishedReview(
  critique: GameCritique | null | undefined,
  legacyScore: unknown,
  includeCommunity = false,
) {
  const calculation = getPersonalScoreCalculation(critique, includeCommunity);
  if (calculation) return { score: calculation.finalScore, source: critique?.version === 2 ? 'v2' : 'anterior' } as const;
  const oldScore = critique?.version === 2
    ? boundedReviewNumber(critique.ultima_completa?.nota, 10) ?? boundedReviewNumber(critique.migracion?.nota_anterior, 10)
    : Object.values(critique?.criterios ?? {}).some((value) => value !== null && value !== undefined)
      ? null : boundedReviewNumber(legacyScore, 10);
  return { score: oldScore, source: oldScore === null ? 'none' : 'anterior' } as const;
}

export function getPersonalScoreMeaning(score: number | null) {
  return score === null ? 'Sin valoración completa' : OVERALL_SCORE_SCALE[Math.floor(score)];
}

export function getScoreTone(score: number | null, scale: 10 | 100 = 10) {
  if (score === null) return 'empty';
  const normalized = scale === 100 ? score / 10 : score;
  if (normalized >= 7.5) return 'positive';
  if (normalized >= 5) return 'mixed';
  return 'negative';
}

export function getScoreSummary(score: number | null, scale: 10 | 100 = 10) {
  if (score === null) return 'Sin puntuación';
  const normalized = scale === 100 ? score / 10 : score;
  return normalized >= 7.5 ? 'Favorable' : normalized >= 5 ? 'Mixto' : 'Desfavorable';
}
