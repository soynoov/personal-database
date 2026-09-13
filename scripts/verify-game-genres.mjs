import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const raw = await readFile('games.json', 'utf8');
const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true } });
try {
  const { getGameGenres } = await server.ssrLoadModule('/src/lib/game-genres.ts');
  const { toRouletteGame } = await server.ssrLoadModule('/src/lib/roulette-game.ts');
  const { toCatalogGame, filterCatalogGames } = await server.ssrLoadModule('/src/lib/catalog-game.ts');
  const { getYearRecap } = await server.ssrLoadModule('/src/lib/recap.ts');
  const { applyManualGamePatch } = await server.ssrLoadModule('/src/lib/manual-game-edit.ts');
  const aliases = [' Acción ', 'FPS', 'Shooter', 'DISPAROS', 'Simuladores', 'simulation', 'PUZZLES', 'Puzles', 'Platformer', 'plataformas', 'FREE-TO-PLAY', 'Indie', 'Acceso anticipado'];
  const before = [...aliases];
  const expected = ['Shooter', 'Simulación', 'Puzles', 'Plataformas', 'Acción'];
  assert.deepEqual(getGameGenres(aliases), expected);
  assert.deepEqual(aliases, before, 'Normalization is read-only');
  assert.deepEqual(getGameGenres(getGameGenres(aliases)), expected, 'Idempotent');
  for (const invalid of [null, undefined, '', {}, 0]) assert.deepEqual(getGameGenres(invalid), []);
  assert.deepEqual(getGameGenres([null, 2, false, '', ' ', 'MOBA', 'moba']), ['MOBA']);
  assert.deepEqual(getGameGenres(['constructor', 'toString', '__proto__']), ['constructor', 'toString', '__proto__']);
  assert.deepEqual(getGameGenres(['Aventura', 'Acción']), ['Aventura', 'Acción'], 'No invented specific category');
  assert.deepEqual(getGameGenres(['Aventura', 'Puzles', 'Plataformas']), ['Puzles', 'Plataformas', 'Aventura']);

  const fixture = { titulo: 'Fixture', estado: 'Completado', fecha_inicio: '2026-01-01', fecha_fin: '2026-02-01', horas: 10, generos: aliases };
  assert.deepEqual(toRouletteGame(fixture).generos, expected);
  const catalog = toCatalogGame(fixture);
  assert.deepEqual(catalog.generos, expected);
  assert.equal(filterCatalogGames([catalog], { search: 'Shooter' }).length, 1);
  assert.deepEqual(getYearRecap([fixture], 2026).generosTop.map(g=>g.name).sort(), [...expected].sort());
  assert.deepEqual(applyManualGamePatch(fixture, { generos: aliases }).game.generos, expected);

  const games = JSON.parse(raw);
  const find = title => games.find(game => game.titulo === title);
  for (const [title, genre] of [['Marvel Rivals','Shooter'], ['Portal 2','Puzles'], ['Celeste','Plataformas'], ['Los Sims 4','Simulación'], ['Dead by Daylight','Terror'], ['League of Legends','MOBA']]) {
    assert.equal(getGameGenres(find(title).generos)[0], genre, title);
  }
  assert.ok(!getGameGenres(find('Portal 2').generos).includes('Shooter'), 'First-person puzzle games are not shooters');
  for (const title of ['Soulworker', 'Governor of Poker 3']) assert.ok(find(title).modos.includes('multijugador'));
  for (const game of games) {
    assert.deepEqual(toCatalogGame(game).generos, toRouletteGame(game).generos, game.titulo);
    assert.deepEqual(getGameGenres(game.generos), game.generos, `Canonical genres: ${game.titulo}`);
  }
  assert.equal(await readFile('games.json','utf8'), raw, 'Tests never write to the library');
  console.log('Genres: aliases, safe input, idempotence, coherent consumers, stored clues and read-only library PASS');
} finally { await server.close(); }
