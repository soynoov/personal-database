const REDUNDANT_GENRES = new Set(['free to play']);

const normalizeGenre = (value: unknown) => String(value ?? '').trim().toLowerCase();

/**
 * Géneros visibles y editables. "Free to Play" es un modelo de negocio y ya
 * tiene una etiqueta propia, por lo que no debe duplicarse como género.
 */
export function getGameGenres(genres: string[] | null | undefined) {
  return [...new Set(
    (genres ?? [])
      .map((genre) => String(genre).trim())
      .filter((genre) => genre && !REDUNDANT_GENRES.has(normalizeGenre(genre))),
  )];
}
