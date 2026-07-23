import type { GameCritique } from './local-games';

export type ReviewCriterionKey =
  | 'jugabilidad'
  | 'historia'
  | 'musica'
  | 'graficos_arte'
  | 'entretenimiento';

export type ReviewCriterionDefinition = {
  key: ReviewCriterionKey;
  label: string;
  max: number;
  weight: number;
  measures: string;
  scale?: Record<number, string>;
};

export const REVIEW_CRITERIA: ReviewCriterionDefinition[] = [
  {
    key: 'jugabilidad',
    label: 'Jugabilidad',
    max: 5,
    weight: 1,
    measures: 'La experiencia al jugar y el funcionamiento de sus mecánicas.',
  },
  {
    key: 'historia',
    label: 'Historia',
    max: 5,
    weight: 1,
    measures: 'La calidad de la historia y cómo está contada.',
  },
  {
    key: 'musica',
    label: 'Música (OST)',
    max: 3,
    weight: 1,
    measures: 'El impacto y el recuerdo que deja su banda sonora.',
    scale: {
      1: 'Música que no impacta ni recuerdas.',
      2: 'Música que acompaña, pero no recuerdas.',
      3: 'Temas que quieres escuchar y recordarás.',
    },
  },
  {
    key: 'graficos_arte',
    label: 'Gráficos / arte',
    max: 5,
    weight: 1,
    measures: 'La calidad visual y su dirección artística.',
  },
  {
    key: 'entretenimiento',
    label: 'Entretenimiento',
    max: 5,
    weight: 0.75,
    measures: 'Lo que lo has disfrutado y lo que te ha gustado.',
  },
];

export type ReviewCriterionScore = ReviewCriterionDefinition & {
  value: number | null;
  normalized: number | null;
  description: string | null;
};

const toBoundedNumber = (value: unknown, min: number, max: number) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
};

export function getReviewCriterionScores(critique: GameCritique | null | undefined): ReviewCriterionScore[] {
  return REVIEW_CRITERIA.map((criterion) => {
    const value = toBoundedNumber(critique?.criterios?.[criterion.key], 1, criterion.max);
    return {
      ...criterion,
      value,
      normalized: value === null ? null : (value / criterion.max) * 10,
      description: value === null ? null : criterion.scale?.[value] ?? null,
    };
  });
}

/**
 * Cada criterio se normaliza a 10 antes de aplicar su peso.
 * Entretenimiento tiene un peso menor (0,75); el resto pesa 1.
 * La nota solo existe cuando todos los criterios definidos están completos.
 */
export function calculatePersonalScore(critique: GameCritique | null | undefined): number | null {
  const scores = getReviewCriterionScores(critique);
  if (scores.some((score) => score.normalized === null)) return null;

  const totalWeight = scores.reduce((total, score) => total + score.weight, 0);
  const average = scores.reduce(
    (total, score) => total + (score.normalized ?? 0) * score.weight,
    0,
  ) / totalWeight;
  return Number(average.toFixed(1));
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
  if (normalized >= 7.5) return 'Favorable';
  if (normalized >= 5) return 'Mixto';
  return 'Desfavorable';
}
