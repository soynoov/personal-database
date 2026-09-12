import type { LocalGame } from './local-games';
import { REVIEW_CRITERIA, getPublishedReview, isCommunityCriterionApplicable } from './game-reviews';
import { boundedReviewNumber } from './review-legacy';

/** Idempotente, sin I/O y sin modificar el objeto original ni datos ajenos a la valoración. */
export function migrateGameReview(game: LocalGame): LocalGame {
  if (game.critica?.version === 2) return game;
  const old = game.critica;
  const storedScore = boundedReviewNumber(game.nota, 10);
  const hasPersonalData = storedScore !== null
    || Object.values(old?.criterios ?? {}).some((value) => value !== null && value !== undefined)
    || (old?.mencion_honorifica?.nivel ?? 0) > 0;
  if (!hasPersonalData) return game;
  // La web anterior calculaba desde criterios completos, incluso si `nota` estaba desactualizada.
  const previousScore = getPublishedReview(old, storedScore, isCommunityCriterionApplicable(game)).score;
  const criteria = Object.fromEntries(REVIEW_CRITERIA.map((item) => [
    item.key,
    // Rendimiento y Progresión no existían. No inferirlos de horas, estados o notas.
    item.key === 'rendimiento' || item.key === 'progresion' ? null : boundedReviewNumber(old?.criterios?.[item.key], item.max),
  ]));
  const originality = boundedReviewNumber(old?.criterios?.originalidad, 1);
  return {
    ...game,
    nota: previousScore,
    critica: {
      ...old,
      version: 2,
      criterios: criteria,
      original: originality === null ? null : originality === 1,
      no_aplica: [],
      migracion: {
        version_origen: 1,
        nota_anterior: previousScore,
        nota_guardada: storedScore,
        critica_anterior: old ? structuredClone(old) : null,
      },
    },
  };
}

export function migrateGameReviews(games: LocalGame[]) {
  return games.map(migrateGameReview);
}
