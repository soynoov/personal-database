export type LauncherHours = { launcher: string; minutos: number | null };
type HoursGame = { launcher?: string | null; horas?: number | null; horas_por_launcher?: LauncherHours[] | null };
export function parseLauncherHours(value: unknown): LauncherHours[];
export function getGameHourEntries(game: HoursGame): LauncherHours[];
export function getGameLaunchers(game: HoursGame): string[];
export function getTotalGameHours(game: HoursGame): number | null;
export function withComputedHours<T extends HoursGame>(game: T): T;
export function updateLauncherMinutes<T extends HoursGame>(game: T, launcher: string, minutos: number | null): T;
export function scopeGameHoursToLauncher<T extends HoursGame>(game: T, launcher: string): T | null;
