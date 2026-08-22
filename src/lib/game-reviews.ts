import type { GameCritique, LocalGame } from './local-games';

export type ReviewCriterionKey =
  | 'jugabilidad'
  | 'historia'
  | 'musica'
  | 'graficos_arte'
  | 'entretenimiento'
  | 'comunidad';

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
  {
    key: 'comunidad',
    label: 'Comunidad',
    max: 5,
    weight: 1,
    measures: 'La limpieza, deportividad y trato entre quienes juegan.',
    scale: {
      1: 'Muy tóxica o insegura: los insultos, las trampas o el acoso son habituales.',
      2: 'Poco agradable: predominan los conflictos y las conductas negativas.',
      3: 'Mixta: alterna gente agradable con episodios frecuentes de toxicidad.',
      4: 'Mayormente limpia y respetuosa, con problemas puntuales.',
      5: 'Muy sana y acogedora: juego limpio, respeto y buena convivencia.',
    },
  },
];

export function isCommunityCriterionApplicable(
  game: Pick<LocalGame, 'solo' | 'tags' | 'generos' | 'rango_actual' | 'rango_maximo'>,
) {
  const normalizedTags = Array.isArray(game.tags)
    ? game.tags.map((tag) => String(tag).trim().toLowerCase())
    : [];
  const normalizedGenres = Array.isArray(game.generos)
    ? game.generos.map((genre) => String(genre).trim().toLowerCase())
    : [];

  return (
    game.solo === false ||
    normalizedTags.includes('competitivo') ||
    normalizedGenres.some((genre) => genre.includes('multijugador') || genre.includes('multiplayer')) ||
    Boolean(game.rango_actual || game.rango_maximo)
  );
}

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

export function getReviewCriterionScores(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): ReviewCriterionScore[] {
  const applicableCriteria = includeCommunity
    ? REVIEW_CRITERIA
    : REVIEW_CRITERIA.filter((criterion) => criterion.key !== 'comunidad');

  return applicableCriteria.map((criterion) => {
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
export function calculatePersonalScore(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): number | null {
  const scores = getReviewCriterionScores(critique, includeCommunity);
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
