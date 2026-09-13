import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { removePersonalNotes } from '../src/lib/game-personal-notes.mjs';
import { createGameBlobStore } from '../src/lib/game-blob-store.mjs';
import { mergeGameAdditions } from '../src/lib/game-library.mjs';

const source = [{ titulo: 'Sin apuntes', estado: 'Terminado', launcher: 'Steam', plataforma: 'PC',
  horas: 100, nota: 7, precio_pagado: 10, precio_actual: 20, fecha_inicio: null, fecha_fin: null,
  comentarios: 'Texto personal', notas: null, lanzamiento_nota: 'Lanzamiento original, no el port.',
  logros: { actual: 0, total: 10 },
  critica: { metascore: 0, userscore: 7, mencion_honorifica: { nivel: 2, comentario: 'Antigua mención' },
    migracion: { version_origen: 1, nota_anterior: 7, nota_guardada: 7,
      critica_anterior: { mencion_honorifica: { nivel: 2, comentario: null } } } },
  dlcs: { total: 2, items: [{ titulo: 'DLC gratis', precio_pagado: 0, precio_actual: 5, notas: 'Apunte' },
    { titulo: 'DLC pendiente', precio_pagado: null, notas: null }] },
}];
const before = structuredClone(source);
const cleaned = removePersonalNotes(source);
const expected = structuredClone(source);
delete expected[0].comentarios;
delete expected[0].notas;
delete expected[0].critica.mencion_honorifica.comentario;
delete expected[0].critica.migracion.critica_anterior.mencion_honorifica.comentario;
expected[0].dlcs.items.forEach(item => delete item.notas);
assert.deepEqual(cleaned, expected, 'Only retired free-text fields are removed');
assert.deepEqual(source, before, 'Never mutate the input or the backup');
assert.equal(removePersonalNotes(cleaned), cleaned, 'Idempotent, including object identity');
assert.equal(removePersonalNotes(null), null);
assert.equal(removePersonalNotes(0), 0);
assert.equal(removePersonalNotes(false), false);

let persisted;
const store = createGameBlobStore({}, {
  async put(_path, body, options) {
    assert.equal(options.ifMatch, 'v1');
    assert.equal(options.access, 'private');
    persisted = JSON.parse(body);
    return { etag: 'v2' };
  },
});
await store.write(source, 'v1');
assert.deepEqual(persisted, expected, 'Blob writes cannot resurrect obsolete fields');
const merged = mergeGameAdditions([{ titulo: 'Importación antigua', comentarios: 'No reintroducir', dlcs: { items: [{ titulo: 'Extra', notas: 'No reintroducir' }] } }], source);
await store.write(merged.games, 'v1');
assert.deepEqual(persisted, [...expected, { titulo: 'Importación antigua', dlcs: { items: [{ titulo: 'Extra' }] } }]);

const libraryBefore = await readFile('games.json', 'utf8');
const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true } });
try {
  const { applyManualGamePatch } = await server.ssrLoadModule('/src/lib/manual-game-edit.ts');
  const { applyManualDlcPatch } = await server.ssrLoadModule('/src/lib/manual-dlc-edit.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const { getPublishedReview, isCommunityCriterionApplicable } = await server.ssrLoadModule('/src/lib/game-reviews.ts');
  const { readBundledGames, filterGames } = await server.ssrLoadModule('/src/lib/local-games.ts');
  const { migrateGameReview } = await server.ssrLoadModule('/src/lib/review-migration.ts');
  for (const field of ['comentarios', 'comentario', 'notas']) {
    assert.equal(applyManualGamePatch(source[0], { [field]: 'Ya no se admite' }).status, 400);
  }
  const edited = applyManualGamePatch(source[0], { horas: 101 });
  assert.equal(edited.ok, true);
  assert.equal(removePersonalNotes(edited.game), edited.game);
  assert.equal(edited.game.horas, 101);
  assert.equal(edited.game.nota, 7);
  assert.deepEqual(applyManualDlcPatch(source[0].dlcs.items[0], undefined, '2026-09-13'), expected[0].dlcs.items[0]);
  const migratedV2 = migrateGameReview({ ...source[0], critica: { ...source[0].critica, version: 2 } });
  assert.equal(removePersonalNotes(migratedV2), migratedV2, 'Previously migrated reviews are also cleaned');
  assert.deepEqual(getGameValueMetrics(source[0]), getGameValueMetrics(cleaned[0]), 'Costs, usage and purchase balance are unchanged');
  assert.deepEqual(getPublishedReview(source[0].critica, source[0].nota, false), getPublishedReview(cleaned[0].critica, cleaned[0].nota, false));
  assert.deepEqual(filterGames(source, { search: 'Texto personal' }), [], 'Retired notes are not searchable');
  const games = await readBundledGames();
  assert.equal(removePersonalNotes(games), games, 'Rendered library contains no retired fields');
  for (const game of games) {
    const withLegacyNotes = { ...game, comentarios: 'Legacy input' };
    assert.deepEqual(getGameValueMetrics(withLegacyNotes), getGameValueMetrics(game));
    assert.deepEqual(getPublishedReview(withLegacyNotes.critica, withLegacyNotes.nota, isCommunityCriterionApplicable(withLegacyNotes)), getPublishedReview(game.critica, game.nota, isCommunityCriterionApplicable(game)));
  }
  assert.equal(await readFile('games.json', 'utf8'), libraryBefore, 'Tests do not write the real library');
  console.log(`Personal notes: scoped removal, immutable migration, storage/import protection, editors and ${games.length} scores/financial metrics PASSED.`);
} finally { await server.close(); }
