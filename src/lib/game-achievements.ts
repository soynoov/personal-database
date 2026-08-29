import type { LocalGame } from './local-games';

type AchievementGame = Pick<LocalGame, 'logros'>;

export function hasCompletedAllAchievements(game: AchievementGame): boolean {
  const current = Number(game.logros?.actual);
  const total = Number(game.logros?.total);
  return Number.isFinite(current) && Number.isFinite(total) && total > 0 && current >= total;
}
