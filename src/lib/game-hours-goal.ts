import type { GameValueMetrics } from './game-finance';

export type HoursGoalState = 'incomplete' | 'no-cost' | 'missing-hours' | 'in-progress' | 'achieved';
export type HoursGoal = {
  state: HoursGoalState;
  actualHours: number | null;
  targetHours: number | null;
  remainingHours: number | null;
  progressPercent: number | null;
  provisional: boolean;
};

/** Present the existing economic formula as one goal, never as two independent bars. */
export function getEconomicHoursGoal(metrics: GameValueMetrics): HoursGoal {
  const goal: HoursGoal = {
    state: 'incomplete',
    actualHours: metrics.realHours,
    targetHours: metrics.economicTargetRealHours,
    remainingHours: null,
    progressPercent: null,
    provisional: metrics.usageProvisional,
  };
  if (!metrics.canCalculateUsage) return goal;
  if (metrics.recordedSpend === 0) return { ...goal, state: 'no-cost', targetHours: null };
  if (goal.targetHours === null || !Number.isFinite(goal.targetHours) || goal.targetHours <= 0) return goal;
  if (goal.actualHours === null) return { ...goal, state: 'missing-hours' };

  const achieved = metrics.economicRemainingHours === 0;
  return {
    ...goal,
    state: achieved ? 'achieved' : 'in-progress',
    remainingHours: metrics.economicRemainingHours,
    // Reaching the goal is 100%, even when many more hours have been played.
    // Rounding must not label an unfinished goal as 100%.
    progressPercent: achieved ? 100 : Math.max(0, Math.min(99, Math.round(metrics.economicProgressPercent ?? 0))),
  };
}
