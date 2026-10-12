/** Counters are cumulative, independent per launcher, and stored in whole minutes. */
const key = value => String(value ?? '').trim().toLocaleLowerCase('es');

export function parseLauncherHours(value) {
  if (!Array.isArray(value) || !value.length || value.length > 30) {
    throw new Error('Registra entre 1 y 30 contadores.');
  }
  const seen = new Set();
  return value.map(entry => {
    if (!entry || typeof entry.launcher !== 'string' || !entry.launcher.trim() || entry.launcher.trim().length > 80) {
      throw new Error('Cada contador necesita un nombre de launcher.');
    }
    const launcher = entry.launcher.trim();
    if (entry.etiqueta != null && typeof entry.etiqueta !== 'string') throw new Error('La etiqueta del contador debe ser texto.');
    const etiqueta = entry.etiqueta?.trim() || '';
    if (etiqueta.length > 80) throw new Error('La etiqueta del contador es demasiado larga.');
    const identity = `${key(launcher)}\0${key(etiqueta)}`;
    if (seen.has(identity)) throw new Error('No repitas el mismo launcher y contador. Usa una etiqueta para distinguir un Playtest.');
    seen.add(identity);
    const minutos = entry.minutos;
    if (minutos !== null && (!Number.isSafeInteger(minutos) || minutos < 0 || minutos > 60_000_000)) {
      throw new Error('Las horas deben expresarse en minutos enteros no negativos.');
    }
    return { launcher, minutos, ...(etiqueta ? { etiqueta } : {}) };
  });
}

export function getGameHourEntries(game) {
  if (game.horas_por_launcher != null) return parseLauncherHours(game.horas_por_launcher);
  const hours = game.horas;
  return [{ launcher: game.launcher?.trim() || 'Sin launcher', minutos:
    typeof hours === 'number' && Number.isFinite(hours) && hours >= 0 ? Math.round(hours * 60) : null }];
}

export function getGameLaunchers(game) {
  // Explicit counters are the source of launcher membership; the old field is primary metadata only.
  const names = game.horas_por_launcher != null
    ? getGameHourEntries(game).map(entry => entry.launcher)
    : [game.launcher];
  return [...new Map(names.filter(name => name && key(name) !== 'sin launcher').map(name => [key(name), name])).values()];
}

export function getTotalGameHours(game) {
  if (game.horas_por_launcher == null) return game.horas ?? null;
  const known = getGameHourEntries(game).filter(entry => entry.minutos !== null);
  return known.length ? known.reduce((sum, entry) => sum + entry.minutos, 0) / 60 : null;
}

export function withComputedHours(game) {
  if (game.horas_por_launcher == null) return game;
  const entries = getGameHourEntries(game);
  const primary = entries.find(entry => key(entry.launcher) === key(game.launcher))
    ?? entries.find(entry => key(entry.launcher) !== 'sin launcher');
  return { ...game, launcher: primary && key(primary.launcher) !== 'sin launcher' ? primary.launcher : null, horas: getTotalGameHours(game) };
}

/** Used by imports: replace one cumulative counter, never add it to its previous value. */
export function updateLauncherMinutes(game, launcher, minutos, etiqueta) {
  const [next] = parseLauncherHours([{ launcher, minutos, etiqueta }]);
  const entries = getGameHourEntries(game);
  const index = entries.findIndex(entry => key(entry.launcher) === key(next.launcher) && key(entry.etiqueta) === key(next.etiqueta));
  if (index < 0) entries.push(next);
  else entries[index] = next;
  return withComputedHours({ ...game, horas_por_launcher: entries });
}

export function getGameHourEntryLabel(entry) {
  return entry.etiqueta ? `${entry.launcher} · ${entry.etiqueta}` : entry.launcher;
}

export function scopeGameHoursToLauncher(game, launcher) {
  if (!launcher) return withComputedHours(game);
  const entries = getGameHourEntries(game).filter(entry => key(entry.launcher) === key(launcher));
  return entries.length ? withComputedHours({ ...game, launcher, horas_por_launcher: entries }) : null;
}
