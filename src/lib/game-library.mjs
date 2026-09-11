/** The same stable identity used by the game's URL. */
export function slugifyGameTitle(title) {
  return String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class GamesVersionConflictError extends Error {
  constructor() {
    super('La biblioteca cambió mientras editabas.');
    this.name = 'GamesVersionConflictError';
  }
}

/** Refuse ambiguous or invalid input before any persistent write. */
export function validateGameLibrary(games, source = 'La biblioteca') {
  if (!Array.isArray(games)) throw new Error(`${source} debe ser una lista de juegos.`);
  const slugs = new Set();
  for (const game of games) {
    if (!game || typeof game.titulo !== 'string' || !slugifyGameTitle(game.titulo)) {
      throw new Error(`${source} contiene un juego sin título válido.`);
    }
    const slug = slugifyGameTitle(game.titulo);
    if (slugs.has(slug)) throw new Error(`${source} contiene un título duplicado: ${game.titulo}.`);
    slugs.add(slug);
  }
  return games;
}

/** Existing Blob records always win: this is an import of additions, not a replacement. */
export function mergeGameAdditions(bundledGames, storedGames) {
  validateGameLibrary(bundledGames, 'games.json');
  validateGameLibrary(storedGames, 'Vercel Blob');
  const existing = new Set(storedGames.map((game) => slugifyGameTitle(game.titulo)));
  const additions = bundledGames.filter((game) => !existing.has(slugifyGameTitle(game.titulo)));
  return {
    games: [...storedGames, ...structuredClone(additions)],
    added: additions.map((game) => game.titulo),
  };
}

/** Re-read and re-merge after a concurrent online edit; never retry a stale payload. */
export async function syncGameAdditions(bundledGames, store, { dryRun = false, attempts = 3 } = {}) {
  validateGameLibrary(bundledGames, 'games.json');
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const snapshot = await store.read();
    const { games, added } = mergeGameAdditions(bundledGames, snapshot?.games ?? []);
    const summary = { added, total: games.length, dryRun };
    if (dryRun || added.length === 0) return summary;
    try {
      await store.write(games, snapshot?.etag ?? null);
      return summary;
    } catch (error) {
      if (!(error instanceof GamesVersionConflictError) || attempt === attempts - 1) throw error;
    }
  }
  throw new Error('La sincronización necesita al menos un intento.');
}
