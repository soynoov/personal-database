import { getPaidUnitPrice, getPurchasedUnits, type LocalGame } from './local-games';
import { normalizeStatus } from './game-status';
import { hasGameTag } from './game-tags';
import {
  getPersonalScoreCalculation,
  getReviewCriterionScores,
  isCommunityCriterionApplicable,
} from './game-reviews';

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const finiteNonNegative = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const isAcquiredDlc = (
  dlc: NonNullable<NonNullable<LocalGame['dlcs']>['items']>[number],
) => Boolean(dlc.fecha_adquisicion) || finiteNonNegative(dlc.precio_pagado) !== null;

export function getRecordedBaseSpend(game: LocalGame): number | null {
  if (hasGameTag(game.tags, 'free-to-play')) return 0;
  const unitPrice = getPaidUnitPrice(game);
  if (unitPrice === null || unitPrice < 0) return null;
  return round(unitPrice * getPurchasedUnits(game));
}

export function getRecordedMicrotransactionSpend(game: LocalGame): number {
  return round(finiteNonNegative(game.gasto_microtransacciones) ?? 0);
}

export function getRecordedDlcSpend(game: LocalGame) {
  const acquired = (game.dlcs?.items ?? []).filter(isAcquiredDlc);
  const incomplete = acquired.filter((dlc) => finiteNonNegative(dlc.precio_pagado) === null);
  const spend = acquired.reduce(
    (total, dlc) => total + (finiteNonNegative(dlc.precio_pagado) ?? 0),
    0,
  );

  return {
    acquired,
    incomplete,
    spend: round(spend),
  };
}

export function getScoreMultiplier(score: number | null) {
  if (score === null || !Number.isFinite(score)) return 1;
  return round(1 + Math.max(0, Math.min(1, (score - 7.5) / 2.5)) * 0.1, 4);
}

export type PurchasePriceComparison = {
  direction: 'discount' | 'same' | 'premium';
  amountPerUnit: number;
  percent: number;
};

export function getPurchasePriceComparison(
  paidValue: unknown,
  referenceValue: unknown,
): PurchasePriceComparison | null {
  const paid = finiteNonNegative(paidValue);
  const reference = finiteNonNegative(referenceValue);
  if (paid === null || reference === null || reference <= 0) return null;

  const signedDifference = round(reference - paid);
  return {
    direction: signedDifference > 0 ? 'discount' : signedDifference < 0 ? 'premium' : 'same',
    amountPerUnit: Math.abs(signedDifference),
    percent: round((Math.abs(signedDifference) / reference) * 100, 1),
  };
}

export type GameValueMetrics = {
  purchasedUnits: number;
  isFreeToPlay: boolean;
  baseSpend: number | null;
  dlcSpend: number;
  microtransactionSpend: number;
  recordedSpend: number;
  dataComplete: boolean;
  incompleteReasons: string[];
  acquiredDlcCount: number;
  realHours: number | null;
  personalScore: number | null;
  scoreComplete: boolean;
  scoreMultiplier: number;
  scoreBonusPercent: number;
  weightedHours: number | null;
  economicTargetHours: number | null;
  economicTargetRealHours: number | null;
  economicProgressPercent: number | null;
  economicRemainingHours: number | null;
  economicMultiple: number | null;
  economicSurplusHours: number | null;
  costPerRealHour: number | null;
  adjustedCostPerHour: number | null;
  hltbTargetHours: number | null;
  hltbProgressPercent: number | null;
  hltbRemainingHours: number | null;
  hltbMultiple: number | null;
  showHltbTarget: boolean;
};

export function getGameValueMetrics(game: LocalGame): GameValueMetrics {
  const purchasedUnits = getPurchasedUnits(game);
  const isFreeToPlay = hasGameTag(game.tags, 'free-to-play');
  const baseSpend = getRecordedBaseSpend(game);
  const dlcs = getRecordedDlcSpend(game);
  const microtransactionSpend = getRecordedMicrotransactionSpend(game);
  const incompleteReasons: string[] = [];

  if (baseSpend === null) incompleteReasons.push('Falta el precio pagado del juego base.');
  if (dlcs.incomplete.length > 0) {
    incompleteReasons.push(
      `${dlcs.incomplete.length} DLC${dlcs.incomplete.length === 1 ? '' : 's'} adquirido${dlcs.incomplete.length === 1 ? '' : 's'} sin precio pagado.`,
    );
  }

  const dataComplete = incompleteReasons.length === 0;
  const recordedSpend = round((baseSpend ?? 0) + dlcs.spend + microtransactionSpend);
  const parsedHours = finiteNonNegative(game.horas);
  const realHours = game.horas === null || game.horas === undefined ? null : parsedHours;

  const includeCommunity = isCommunityCriterionApplicable(game);
  const criterionScores = getReviewCriterionScores(game.critica, includeCommunity);
  const hasCriterionData = criterionScores.some((criterion) => criterion.value !== null);
  const scoreCalculation = getPersonalScoreCalculation(game.critica, includeCommunity);
  const parsedLegacyScore = finiteNonNegative(game.nota);
  const legacyScore = parsedLegacyScore !== null && parsedLegacyScore <= 10
    ? parsedLegacyScore
    : null;
  const personalScore = scoreCalculation?.finalScore ?? (!hasCriterionData ? legacyScore : null);
  const scoreComplete = personalScore !== null;
  const scoreMultiplier = getScoreMultiplier(personalScore);
  const scoreBonusPercent = round((scoreMultiplier - 1) * 100, 1);
  const weightedHours = realHours === null ? null : round(realHours * scoreMultiplier, 2);
  const economicTargetHours = dataComplete ? recordedSpend : null;
  const economicTargetRealHours = dataComplete && recordedSpend > 0
    ? round(recordedSpend / scoreMultiplier, 2)
    : null;

  let economicProgressPercent: number | null = null;
  let economicRemainingHours: number | null = null;
  let economicMultiple: number | null = null;
  let economicSurplusHours: number | null = null;

  if (dataComplete && realHours !== null) {
    if (recordedSpend === 0) {
      economicProgressPercent = 100;
      economicRemainingHours = 0;
      economicMultiple = realHours > 0 ? null : 1;
      economicSurplusHours = weightedHours ?? 0;
    } else {
      const weighted = weightedHours ?? 0;
      economicProgressPercent = round((weighted / recordedSpend) * 100, 1);
      economicRemainingHours = round(
        Math.max(0, (recordedSpend - weighted) / scoreMultiplier),
        2,
      );
      economicMultiple = round(weighted / recordedSpend, 2);
      economicSurplusHours = round(Math.max(0, weighted - recordedSpend), 2);
    }
  }

  const costPerRealHour = dataComplete && realHours !== null && realHours > 0
    ? round(recordedSpend / realHours, 2)
    : null;
  const adjustedCostPerHour = dataComplete && weightedHours !== null && weightedHours > 0
    ? round(recordedSpend / weightedHours, 2)
    : null;

  const breakdownMain = finiteNonNegative(game.hltb_breakdown?.main);
  const legacyHltb = finiteNonNegative(game.hltb);
  const hltbReference = breakdownMain && breakdownMain > 0
    ? breakdownMain
    : legacyHltb && legacyHltb > 0
      ? legacyHltb
      : null;
  const normalizedStatus = normalizeStatus(game.estado);
  const showHltbTarget = normalizedStatus !== 'recurrente' && !hasGameTag(game.tags, 'competitivo');
  const hltbTargetHours = showHltbTarget ? hltbReference : null;
  const hltbProgressPercent = hltbTargetHours !== null && realHours !== null
    ? round((realHours / hltbTargetHours) * 100, 1)
    : null;
  const hltbRemainingHours = hltbTargetHours !== null && realHours !== null
    ? round(Math.max(0, hltbTargetHours - realHours), 2)
    : null;
  const hltbMultiple = hltbTargetHours !== null && realHours !== null
    ? round(realHours / hltbTargetHours, 2)
    : null;

  return {
    purchasedUnits,
    isFreeToPlay,
    baseSpend,
    dlcSpend: dlcs.spend,
    microtransactionSpend,
    recordedSpend,
    dataComplete,
    incompleteReasons,
    acquiredDlcCount: dlcs.acquired.length,
    realHours,
    personalScore,
    scoreComplete,
    scoreMultiplier,
    scoreBonusPercent,
    weightedHours,
    economicTargetHours,
    economicTargetRealHours,
    economicProgressPercent,
    economicRemainingHours,
    economicMultiple,
    economicSurplusHours,
    costPerRealHour,
    adjustedCostPerHour,
    hltbTargetHours,
    hltbProgressPercent,
    hltbRemainingHours,
    hltbMultiple,
    showHltbTarget,
  };
}

export type GameProfitabilityStatus = 'amortized' | 'unamortized' | 'incomplete';

export function getGameProfitabilityStatus(game: LocalGame): GameProfitabilityStatus {
  const metrics = getGameValueMetrics(game);
  if (!metrics.dataComplete) return 'incomplete';
  if (metrics.recordedSpend === 0) return 'amortized';
  if (metrics.economicRemainingHours === null) return 'incomplete';
  return metrics.economicRemainingHours <= 0 ? 'amortized' : 'unamortized';
}

export function isGameAmortized(game: LocalGame): boolean {
  return getGameProfitabilityStatus(game) === 'amortized';
}

export function formatHoursDuration(value: number | null, fallback = '—') {
  if (value === null || !Number.isFinite(value)) return fallback;
  const totalMinutes = Math.max(0, Math.round(value * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function formatEuro(value: number | null, fallback = '—') {
  if (value === null || !Number.isFinite(value)) return fallback;
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}
