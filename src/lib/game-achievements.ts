import type { LocalGame } from './local-games';

type AchievementGame = Pick<LocalGame, 'logros'>;
type GoldenCompletionGame = Pick<LocalGame, 'logros' | 'partidas_al_100'>;

export type GoldenCompletionKind = 'game' | 'achievements' | null;

export function hasCompletedAllAchievements(game: AchievementGame): boolean {
  const current = Number(game.logros?.actual);
  const total = Number(game.logros?.total);
  return Number.isFinite(current) && Number.isFinite(total) && total > 0 && current >= total;
}

export function getFullCompletionRuns(game: Pick<LocalGame, 'partidas_al_100'>): number {
  const runs = Number(game.partidas_al_100);
  return Number.isInteger(runs) && runs > 0 ? runs : 0;
}

export function getGoldenCompletionKind(game: GoldenCompletionGame): GoldenCompletionKind {
  if (getFullCompletionRuns(game) > 0) return 'game';
  return hasCompletedAllAchievements(game) ? 'achievements' : null;
}
