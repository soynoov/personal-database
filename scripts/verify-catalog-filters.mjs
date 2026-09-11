import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });

try {
  const { getGoldenCompletionKind, matchesGoldenFilter } = await server.ssrLoadModule('/src/lib/game-achievements.ts');
  const { filterCatalogGames, toCatalogGame } = await server.ssrLoadModule('/src/lib/catalog-game.ts');
  const game = (titulo, fields = {}) => toCatalogGame({
    titulo, estado: 'Terminado', plataforma: 'PC', launcher: 'Steam', horas: 10,
    fecha_inicio: null, fecha_fin: null, ...fields,
  });
  const games = [
    game('Todos los logros', { estado: 'Recurrente', logros: { actual: 49, total: 49 } }),
    game('Partida al cien', { partidas_al_100: 1, launcher: 'Pirata' }),
    game('Ambos criterios', { partidas_al_100: 2, logros: { actual: 8, total: 8 } }),
    game('Solo terminado', { logros: { actual: 7, total: 8 } }),
    game('Sin logros', { logros: { actual: 0, total: 0 } }),
    game('Sin datos'),
    game('Total desconocido', { logros: { actual: 5, total: null } }),
    game('Partida incompleta', { partidas_al_100: 0.5 }),
  ];
  const titles = (list) => list.map((item) => item.titulo);
  const goldenTitles = ['Todos los logros', 'Partida al cien', 'Ambos criterios'];

  assert.deepEqual(titles(filterCatalogGames(games, { golden: 'true' })), goldenTitles);
  assert.deepEqual(titles(games.filter((item) => matchesGoldenFilter(item, 'true'))), goldenTitles);
  for (const item of games) {
    assert.equal(matchesGoldenFilter(item, 'true'), getGoldenCompletionKind(item) !== null);
  }
  for (const value of [undefined, null, '', 'false', 'invalid']) {
    assert.equal(filterCatalogGames(games, { golden: value }).length, games.length);
  }
  assert.deepEqual(titles(filterCatalogGames(games, { golden: 'true', estado: 'recurrente' })), ['Todos los logros']);
  assert.deepEqual(titles(filterCatalogGames(games, { golden: 'true', estado: 'completado' })), ['Partida al cien', 'Ambos criterios']);
  assert.deepEqual(titles(filterCatalogGames(games, { golden: 'true', launcher: 'Steam' })), ['Todos los logros', 'Ambos criterios']);
  assert.deepEqual(titles(filterCatalogGames(games, { golden: 'true', search: 'Partida' })), ['Partida al cien']);
  assert.deepEqual(filterCatalogGames(games, { golden: 'true', plataforma: 'Switch' }), []);
  assert.deepEqual(filterCatalogGames(games, { golden: 'true', search: 'Solo terminado' }), []);

  console.log('catalog: Golden Card, criterios de completitud y combinación de filtros verificados');
} finally {
  await server.close();
}
