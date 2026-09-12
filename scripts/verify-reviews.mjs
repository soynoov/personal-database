import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true } });
try {
  const { REVIEW_CRITERIA, calculatePersonalScore, getPublishedReview, getReviewProgress, isCommunityCriterionApplicable } = await server.ssrLoadModule('/src/lib/game-reviews.ts');
  const { migrateGameReview, migrateGameReviews } = await server.ssrLoadModule('/src/lib/review-migration.ts');
  const { applyManualGamePatch } = await server.ssrLoadModule('/src/lib/manual-game-edit.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const fixture = { titulo: 'Prueba de valoración', estado: 'Terminado', launcher: 'Steam', plataforma: 'PC', horas: 100,
    fecha_inicio: null, fecha_fin: null, precio_pagado: 20, modos: ['solitario'], comentarios: 'Conservar este apunte.',
    critica: { metascore: 64, userscore: 5.5, criterios: { jugabilidad: 4, historia: 3, musica: 2, graficos_arte: 4, entretenimiento: 4, comunidad: 1, originalidad: 1 },
      mencion_honorifica: { nivel: 2, comentario: 'Apunte histórico, no eliminar.' } } };
  fixture.nota = calculatePersonalScore(fixture.critica, false);
  const original = structuredClone(fixture);
  const migrated = migrateGameReview(fixture);
  assert.deepEqual(fixture, original, 'no muta la entrada');
  assert.equal(migrated.critica.version, 2);
  assert.equal(migrated.critica.criterios.rendimiento, null);
  assert.equal(migrated.critica.criterios.progresion, null);
  assert.deepEqual(migrated.critica.migracion.critica_anterior, original.critica);
  assert.equal(migrated.critica.migracion.nota_anterior, original.nota);
  assert.equal(migrated.critica.original, true);
  assert.equal(migrateGameReview(migrated), migrated, 'migración idempotente');
  assert.deepEqual(migrateGameReviews([migrated]), [migrated]);
  assert.equal(getPublishedReview(migrated.critica, migrated.nota).score, original.nota);
  assert.equal(calculatePersonalScore(migrated.critica), null, 'no inventa una nota nueva incompleta');
  assert.equal(getGameValueMetrics(migrated).scoreMultiplier, getGameValueMetrics(original).scoreMultiplier, 'el bonus financiero anterior se conserva');
  const staleCache = { ...original, nota: 10 };
  const migratedStale = migrateGameReview(staleCache);
  assert.equal(migratedStale.critica.migracion.nota_guardada, 10, 'archiva la nota persistida aunque estuviera desactualizada');
  assert.equal(getGameValueMetrics(migratedStale).scoreMultiplier, getGameValueMetrics(staleCache).scoreMultiplier, 'mantiene la nota que realmente calculaba la web');
  const maximum = { version: 2, criterios: Object.fromEntries(REVIEW_CRITERIA.map((item) => [item.key, item.max])), original: false, no_aplica: [] };
  assert.equal(REVIEW_CRITERIA.reduce((sum, item) => sum + item.weight, 0), 100);
  assert.equal(calculatePersonalScore(maximum, true), 10);
  assert.equal(calculatePersonalScore({ ...maximum, original: true, mencion_honorifica: { nivel: 3 } }, true), 10);
  const zero = { ...maximum, criterios: Object.fromEntries(REVIEW_CRITERIA.map((item) => [item.key, 0])) };
  assert.equal(calculatePersonalScore(zero, true), 0);
  const seven = { ...maximum, criterios: Object.fromEntries(REVIEW_CRITERIA.map((item) => [item.key, item.max * .7])) };
  assert.equal(calculatePersonalScore(seven, true), 7, 'normaliza antes de ponderar');
  const almostPerfect = { ...maximum, criterios: { ...maximum.criterios, entretenimiento: 4.999 } };
  assert.equal(calculatePersonalScore(almostPerfect, true), 9.9, 'ningún redondeo regala un 10');
  const missing = { ...maximum, criterios: { ...maximum.criterios, rendimiento: null } };
  assert.equal(calculatePersonalScore(missing, true), null);
  const excluded = { ...maximum, no_aplica: ['musica', 'historia', 'progresion', 'comunidad'], criterios: { ...maximum.criterios, musica: null, historia: null, progresion: null, comunidad: null } };
  assert.equal(calculatePersonalScore(excluded, true), 10, 'redistribuye solo No aplica');
  assert.equal(getReviewProgress(excluded, true).applicable.length, 4);
  assert.equal(calculatePersonalScore({ ...missing, no_aplica: ['rendimiento'] }, true), null, 'no permite omitir un área central');
  assert.equal(isCommunityCriterionApplicable({ modos: ['cooperativo'] }), false);
  assert.equal(isCommunityCriterionApplicable({ modos: ['multijugador'] }), true);
  assert.equal(calculatePersonalScore({ ...maximum, criterios: { ...maximum.criterios, comunidad: null } }, false), 10);
  const externalOnly = { ...fixture, nota: null, critica: { metascore: 0, userscore: 0 } };
  assert.equal(migrateGameReview(externalOnly), externalOnly);
  const numeric = migrateGameReview({ ...externalOnly, nota: 0 });
  assert.equal(numeric.critica.migracion.nota_anterior, 0, 'cero no es vacío');
  const saved = applyManualGamePatch(migrated, { critica_personal: { ...maximum, base_revision: JSON.stringify(migrated.critica) } });
  assert.equal(saved.ok, true);
  assert.equal(saved.game.nota, 10);
  assert.equal(saved.game.critica.metascore, 64);
  assert.equal(saved.game.critica.userscore, 5.5);
  assert.deepEqual(saved.game.critica.migracion, migrated.critica.migracion);
  assert.equal(saved.game.comentarios, original.comentarios);
  assert.equal(saved.game.precio_pagado, original.precio_pagado);
  for (const bad of [-1, 6, true, 'foo', 2.4]) {
    assert.equal(applyManualGamePatch(migrated, { critica_personal: { ...maximum, criterios: { ...maximum.criterios, jugabilidad: bad } } }).ok, false);
  }
  assert.equal(applyManualGamePatch(migrated, { critica_personal: { ...maximum, no_aplica: ['jugabilidad'] } }).ok, false);
  assert.equal(applyManualGamePatch(migrated, { critica_personal: { ...maximum, no_aplica: ['musica'] } }).ok, false);
  assert.equal(applyManualGamePatch(migrated, { critica_personal: { ...maximum, base_revision: 'old' } }).status, 409);
  assert.equal(applyManualGamePatch(migrated, { critica_personal: fixture.critica }).status, 409, 'no admite downgrade desde un formulario antiguo');
  assert.equal(applyManualGamePatch(migrated, { critica: null }).status, 400, 'un payload nulo no destruye el archivo histórico');
  assert.equal(applyManualGamePatch(migrated, { critica_personal: missing }).game.nota, original.nota, 'guardar pendientes mantiene la nota anterior');
  assert.equal(applyManualGamePatch(saved.game, { critica_personal: missing }).game.nota, 10, 'revisar una v2 conserva la última completa, no resucita v1');
  assert.equal(applyManualGamePatch(externalOnly, { critica_personal: missing }).game.nota, null, 'sin nota anterior no inventa un saldo');
  console.log('NooV Score v2: escalas, pesos, pendientes, archivo, migración, guardado, concurrencia y amortización verificados.');
} finally { await server.close(); }
