import type { GameCritique, LocalGame } from './local-games';
import { getGameModes } from './game-modes';

export type ReviewCriterionKey =
  | 'jugabilidad'
  | 'historia'
  | 'musica'
  | 'graficos_arte'
  | 'entretenimiento'
  | 'originalidad'
  | 'comunidad';

export type ReviewCriterionDefinition = {
  key: ReviewCriterionKey;
  label: string;
  min: number;
  max: number;
  weight: number;
  measures: string;
  scale?: Record<number, string>;
};

export const REVIEW_CRITERIA: ReviewCriterionDefinition[] = [
  {
    key: 'jugabilidad',
    label: 'Jugabilidad',
    min: 0,
    max: 5,
    weight: 1,
    measures: 'La experiencia al jugar y el funcionamiento de sus mecánicas.',
  },
  {
    key: 'historia',
    label: 'Historia',
    min: 0,
    max: 5,
    weight: 1,
    measures: 'La calidad de la historia y cómo está contada.',
  },
  {
    key: 'musica',
    label: 'Música (OST)',
    min: 0,
    max: 3,
    weight: 1,
    measures: 'El impacto y el recuerdo que deja su banda sonora.',
    scale: {
      0: 'No aporta nada o perjudica activamente la experiencia.',
      1: 'Música que no impacta ni recuerdas.',
      2: 'Música que acompaña, pero no recuerdas.',
      3: 'Temas que quieres escuchar y recordarás.',
    },
  },
  {
    key: 'graficos_arte',
    label: 'Gráficos / arte',
    min: 0,
    max: 5,
    weight: 1,
    measures: 'La calidad visual y su dirección artística.',
  },
  {
    key: 'entretenimiento',
    label: 'Entretenimiento',
    min: 0,
    max: 5,
    weight: 1,
    measures: 'Lo que lo has disfrutado y lo que te ha gustado.',
  },
  {
    key: 'originalidad',
    label: 'Originalidad',
    min: 0,
    max: 1,
    weight: 1,
    measures: 'Si aporta una idea, enfoque o combinación claramente propia.',
    scale: {
      0: 'No: sigue fórmulas conocidas sin un giro propio claro.',
      1: 'Sí: aporta una idea, enfoque o combinación claramente propia.',
    },
  },
  {
    key: 'comunidad',
    label: 'Comunidad',
    min: 0,
    max: 5,
    weight: 0.5,
    measures: 'La limpieza, deportividad y trato entre quienes juegan.',
    scale: {
      0: 'Inaceptable: la toxicidad, las trampas o el acoso arruinan la experiencia.',
      1: 'Muy tóxica o insegura: los insultos, las trampas o el acoso son habituales.',
      2: 'Poco agradable: predominan los conflictos y las conductas negativas.',
      3: 'Mixta: alterna gente agradable con episodios frecuentes de toxicidad.',
      4: 'Mayormente limpia y respetuosa, con problemas puntuales.',
      5: 'Muy sana y acogedora: juego limpio, respeto y buena convivencia.',
    },
  },
];

export function isCommunityCriterionApplicable(
  game: Pick<LocalGame, 'modos' | 'solo' | 'tags' | 'generos' | 'rango_actual' | 'rango_maximo'>,
) {
  const normalizedTags = Array.isArray(game.tags)
    ? game.tags.map((tag) => String(tag).trim().toLowerCase())
    : [];
  const normalizedGenres = Array.isArray(game.generos)
    ? game.generos.map((genre) => String(genre).trim().toLowerCase())
    : [];
  const hasCompetitiveContext =
    normalizedTags.includes('competitivo') || Boolean(game.rango_actual || game.rango_maximo);
  const modes = getGameModes(game);

  if (hasCompetitiveContext) return true;
  if (modes.includes('multijugador')) return true;
  if (modes.includes('cooperativo')) return false;

  return normalizedGenres.some((genre) => genre.includes('multijugador') || genre.includes('multiplayer'));
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
    const value = toBoundedNumber(
      critique?.criterios?.[criterion.key],
      criterion.min,
      criterion.max,
    );
    return {
      ...criterion,
      value,
      normalized: value === null ? null : (value / criterion.max) * 10,
      description: value === null ? null : criterion.scale?.[value] ?? null,
    };
  });
}

export type PersonalScoreCalculation = {
  earnedPoints: number;
  possiblePoints: number;
  baseScore: number;
  honoraryBonus: number;
  finalScore: number;
};

/**
 * La nota base compara los puntos obtenidos con los puntos máximos posibles.
 * Así, una escala de 3 puntos influye menos que una de 5 de forma natural.
 * Comunidad solo aplica a juegos con comunidad pública o competitivos y pesa 0,5.
 * El cooperativo privado entre amigos queda fuera salvo que también sea competitivo.
 * Originalidad aporta 0 o 1 punto. Si falta en una reseña anterior, se excluye
 * del cálculo para conservar la nota hasta que se valore explícitamente.
 * La mención honorífica suma 0,1 por nivel y la nota final nunca supera 10.
 */
export function getPersonalScoreCalculation(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): PersonalScoreCalculation | null {
  const scores = getReviewCriterionScores(critique, includeCommunity);
  const requiredScores = scores.filter((score) => score.key !== 'originalidad');
  if (requiredScores.some((score) => score.value === null)) return null;

  const scoredCriteria = scores.filter(
    (score): score is ReviewCriterionScore & { value: number } => score.value !== null,
  );

  const earnedPoints = scoredCriteria.reduce(
    (total, score) => total + score.value * score.weight,
    0,
  );
  const possiblePoints = scoredCriteria.reduce(
    (total, score) => total + score.max * score.weight,
    0,
  );
  const baseScoreRaw = (earnedPoints / possiblePoints) * 10;
  const honoraryLevel = toBoundedNumber(critique?.mencion_honorifica?.nivel, 0, 3) ?? 0;
  const honoraryBonus = Number((honoraryLevel * 0.1).toFixed(1));
  const finalScore = Number(Math.min(10, baseScoreRaw + honoraryBonus).toFixed(1));

  return {
    earnedPoints,
    possiblePoints,
    baseScore: Number(baseScoreRaw.toFixed(1)),
    honoraryBonus,
    finalScore,
  };
}

export function calculatePersonalScore(
  critique: GameCritique | null | undefined,
  includeCommunity = false,
): number | null {
  return getPersonalScoreCalculation(critique, includeCommunity)?.finalScore ?? null;
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
