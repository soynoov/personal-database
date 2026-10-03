/** Explicit, scoped import of counters. Never copy unrelated local fields over online edits. */
import { readFile } from 'node:fs/promises';
import { gameBlobCredentials } from './lib/games-sync.mjs';
import { createGameBlobStore } from '../src/lib/game-blob-store.mjs';
import { GamesVersionConflictError } from '../src/lib/game-library.mjs';
import { parseLauncherHours, withComputedHours } from '../src/lib/game-hours.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const titles = args.filter(arg => arg !== '--apply');
if (!titles.length || titles.some(title => title.startsWith('--'))) throw new Error('Uso: node scripts/sync-launcher-hours.mjs [--apply] "Título" ...');
const local = JSON.parse((await readFile('games.json', 'utf8')).replace(/^\uFEFF/, ''));
const sources = titles.map(title => {
  const game = local.find(game => game.titulo === title);
  if (!game) throw new Error(`No existe ${title} en games.json.`);
  return { titulo: title, entries: parseLauncherHours(game.horas_por_launcher) };
});
const credentials = await gameBlobCredentials(process.cwd());
if (!credentials) throw new Error('Faltan las credenciales de almacenamiento.');
const store = createGameBlobStore(credentials);
for (let attempt = 0; attempt < 3; attempt++) {
  const snapshot = await store.read();
  if (!snapshot) throw new Error('La biblioteca publicada no existe; no se creará desde una copia parcial.');
  const games = [...snapshot.games];
  const changed = [];
  for (const source of sources) {
    const index = games.findIndex(game => game.titulo === source.titulo);
    if (index < 0) throw new Error(`No existe ${source.titulo} en la biblioteca publicada.`);
    const game = games[index];
    if (game.horas_por_launcher != null) {
      // Do not reset counters someone has already updated on the website.
      if (JSON.stringify(parseLauncherHours(game.horas_por_launcher)) !== JSON.stringify(source.entries)) {
        console.log(`${source.titulo}: ya tiene contadores online; se conservan sin reemplazarlos.`);
      }
      continue;
    }
    games[index] = withComputedHours({ ...game, launcher: source.entries[0].launcher, horas_por_launcher: source.entries });
    changed.push(source.titulo);
  }
  if (!apply || !changed.length) {
    console.log(`${apply ? 'Sin cambios' : 'Pendientes'}: ${changed.join(', ') || 'ninguno'}.`);
    break;
  }
  try {
    await store.write(games, snapshot.etag);
    const verified = await store.read();
    for (const title of changed) {
      const saved = verified.games.find(game => game.titulo === title);
      const wanted = sources.find(source => source.titulo === title);
      if (JSON.stringify(saved.horas_por_launcher) !== JSON.stringify(wanted.entries)) throw new Error(`No se pudo confirmar el guardado de ${title}.`);
      console.log(`${title}: ${saved.horas} h, contadores guardados y releídos.`);
    }
    break;
  } catch (error) {
    if (!(error instanceof GamesVersionConflictError) || attempt === 2) throw error;
  }
}
