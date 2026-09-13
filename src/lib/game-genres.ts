const normalizeGenre = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
const REDUNDANT_GENRES = new Set(['free to play', 'indie', 'early access', 'acceso anticipado']);
const GENRE_ALIASES: Record<string, string> = {
  accion: 'Acción', action: 'Acción', aventura: 'Aventura', adventure: 'Aventura',
  shooter: 'Shooter', shooters: 'Shooter', disparos: 'Shooter', fps: 'Shooter', tps: 'Shooter',
  'first person shooter': 'Shooter', 'third person shooter': 'Shooter',
  simulacion: 'Simulación', simuladores: 'Simulación', simulation: 'Simulación',
  puzles: 'Puzles', puzzles: 'Puzles', puzzle: 'Puzles', puzle: 'Puzles', rompecabezas: 'Puzles',
  plataformas: 'Plataformas', platformer: 'Plataformas', platformers: 'Plataformas',
  estrategia: 'Estrategia', strategy: 'Estrategia', rol: 'Rol', rpg: 'Rol',
  lucha: 'Lucha', fighting: 'Lucha', carreras: 'Carreras', racing: 'Carreras',
  deportes: 'Deportes', sports: 'Deportes', terror: 'Terror', horror: 'Terror',
  supervivencia: 'Supervivencia', survival: 'Supervivencia', moba: 'MOBA',
  ritmo: 'Ritmo', rhythm: 'Ritmo', cartas: 'Cartas', gestion: 'Gestión',
  sigilo: 'Sigilo', stealth: 'Sigilo', sandbox: 'Sandbox',
  metroidvania: 'Metroidvania', roguelike: 'Roguelike', roguelite: 'Roguelike',
  'battle royale': 'Battle royale', 'mundo abierto': 'Mundo abierto',
  'deduccion social': 'Deducción social', 'novela visual': 'Novela visual',
  'aventura narrativa': 'Aventura narrativa', 'beat em up': "Beat 'em up",
  automatizacion: 'Automatización', construccion: 'Construcción',
  incremental: 'Incremental', programacion: 'Programación', casual: 'Casual',
  investigacion: 'Investigación', exploracion: 'Exploración', software: 'Software',
  'por turnos': 'Por turnos', 'tiempo real': 'Tiempo real', 'auto battler': 'Auto battler',
  'preguntas y respuestas': 'Preguntas y respuestas', "beat 'em up": "Beat 'em up",
};
const BROAD_GENRES = new Set(['Acción', 'Aventura', 'Casual', 'Multijugador masivo']);

/**
 * Vocabulario compartido por ficha, catálogo, estadísticas y ruleta.
 * No infiere géneros del título ni descarga etiquetas populares en runtime.
 * La clasificación se registra en games.json; los datos crudos de Steam se conservan aparte.
 */
export function getGameGenres(genres: string[] | null | undefined) {
  const unique = new Map<string, string>();
  for (const value of Array.isArray(genres) ? genres : []) {
    if (typeof value !== 'string') continue;
    const key = normalizeGenre(value);
    if (!key || REDUNDANT_GENRES.has(key)) continue;
    const label = Object.hasOwn(GENRE_ALIASES, key) ? GENRE_ALIASES[key] : value.trim();
    unique.set(normalizeGenre(label), label);
  }
  // Stable ordering: specific clues first, broad families last.
  return [...unique.values()].sort((a, b) => Number(BROAD_GENRES.has(a)) - Number(BROAD_GENRES.has(b)));
}
