import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const {
    formatHoursDuration,
    getGameProfitabilityStatus,
    getPurchasePriceComparison,
    getGameValueMetrics,
    getScoreMultiplier,
    isGameAmortized,
  } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const { applyManualGamePatch } = await server.ssrLoadModule('/src/lib/manual-game-edit.ts');
  const { getGameGenres } = await server.ssrLoadModule('/src/lib/game-genres.ts');
  const { getPurchaseStoreOptions } = await server.ssrLoadModule('/src/lib/purchase-stores.ts');
  const { getDataCompleteness } = await server.ssrLoadModule('/src/lib/game-data-completeness.ts');

  const game = (overrides = {}) => ({
    titulo: 'Prueba', estado: 'Pendiente', launcher: 'Steam', plataforma: 'PC',
    horas: null, fecha_inicio: null, fecha_fin: null, precio_pagado: 10,
    ...overrides,
  });
  const fullCritique = {
    criterios: {
      jugabilidad: 5, historia: 5, musica: 3, graficos_arte: 5,
      entretenimiento: 5, originalidad: 1,
    },
    mencion_honorifica: { nivel: 0, comentario: null },
  };

  const goblin = getGameValueMetrics(game({ precio_pagado: 10.29, unidades_compradas: 2, horas: 12.2 }));
  assert.equal(goblin.recordedSpend, 20.58);
  assert.equal(formatHoursDuration(goblin.economicRemainingHours), '8 h 23 min');

  const repo = getGameValueMetrics(game({ precio_pagado: 6.33, unidades_compradas: 3, horas: 64.7 }));
  assert.equal(repo.recordedSpend, 18.99);
  assert.equal(repo.economicMultiple, 3.41);

  assert.equal(getScoreMultiplier(7.5), 1);
  assert.equal(getScoreMultiplier(8), 1.02);
  assert.equal(getScoreMultiplier(10), 1.1);

  assert.deepEqual(getPurchasePriceComparison(4.89, 6.99), {
    direction: 'discount', amountPerUnit: 2.1, percent: 30,
  });
  assert.deepEqual(getPurchasePriceComparison(6.99, 6.99), {
    direction: 'same', amountPerUnit: 0, percent: 0,
  });
  assert.deepEqual(getPurchasePriceComparison(7.99, 6.99), {
    direction: 'premium', amountPerUnit: 1, percent: 14.3,
  });
  assert.equal(getPurchasePriceComparison(null, 6.99), null);

  const legacyReviewWithoutOriginality = getGameValueMetrics(game({ horas: 20, critica: { criterios: { ...fullCritique.criterios, originalidad: null } } }));
  assert.equal(legacyReviewWithoutOriginality.scoreComplete, true);
  assert.equal(legacyReviewWithoutOriginality.scoreMultiplier, 1.1);

  const legacyNumericScore = getGameValueMetrics(game({ horas: 20, nota: 9.3 }));
  assert.equal(legacyNumericScore.personalScore, 9.3);
  assert.equal(legacyNumericScore.scoreComplete, true);
  assert.equal(legacyNumericScore.scoreBonusPercent, 7.2);

  const competitiveWithoutCommunity = getGameValueMetrics(game({ horas: 20, tags: ['competitivo'], critica: fullCritique }));
  assert.equal(competitiveWithoutCommunity.scoreComplete, false);
  assert.equal(competitiveWithoutCommunity.showHltbTarget, false);

  const freeToPlay = getGameValueMetrics(game({ precio_pagado: null, tags: ['free-to-play'], gasto_microtransacciones: 50, horas: 10 }));
  assert.equal(freeToPlay.dataComplete, true);
  assert.equal(freeToPlay.recordedSpend, 50);
  assert.equal(freeToPlay.economicRemainingHours, 40);

  assert.equal(getGameValueMetrics(game({ precio_pagado: null })).dataComplete, false);
  assert.equal(getGameValueMetrics(game({ dlcs: { items: [{ titulo: 'DLC', fecha_adquisicion: '2026-01-01', precio_pagado: null }] } })).dataComplete, false);
  assert.equal(getGameValueMetrics(game({ horas: null })).economicProgressPercent, null);
  const zeroHours = getGameValueMetrics(game({ horas: 0 }));
  assert.equal(zeroHours.economicProgressPercent, 0);
  assert.equal(zeroHours.costPerRealHour, null);
  assert.equal(isGameAmortized(game({ precio_pagado: 10, horas: 10 })), true);
  assert.equal(isGameAmortized(game({ precio_pagado: 10, horas: 9.9 })), false);
  assert.equal(isGameAmortized(game({ precio_pagado: 0, horas: null })), true);
  assert.equal(isGameAmortized(game({ precio_pagado: null, horas: 100 })), false);
  assert.equal(getGameProfitabilityStatus(game({ precio_pagado: 10, horas: 10 })), 'amortized');
  assert.equal(getGameProfitabilityStatus(game({ precio_pagado: 10, horas: 9.9 })), 'unamortized');
  assert.equal(getGameProfitabilityStatus(game({ precio_pagado: null, horas: 100 })), 'incomplete');

  const baldursGate = getGameValueMetrics(game({ precio_pagado: 60, horas: 58.5, hltb_breakdown: { main: 72.9 } }));
  assert.equal(formatHoursDuration(baldursGate.economicRemainingHours), '1 h 30 min');
  assert.equal(formatHoursDuration(baldursGate.hltbRemainingHours), '14 h 24 min');

  const marvel = getGameValueMetrics(game({
    estado: 'Recurrente', precio_pagado: null, tags: ['free-to-play', 'competitivo'],
    gasto_microtransacciones: 134.42, horas: 800.6,
    critica: { ...fullCritique, criterios: { ...fullCritique.criterios, comunidad: 5 } },
    hltb_breakdown: { main: 18.2 },
  }));
  assert.equal(marvel.scoreMultiplier, 1.1);
  assert.equal(marvel.weightedHours, 880.66);
  assert.equal(marvel.economicTargetRealHours, 122.2);
  assert.equal(marvel.showHltbTarget, false);
  assert.equal(marvel.economicMultiple, 6.55);

  const manualEdit = applyManualGamePatch(
    game({ estado: 'Pendiente', horas: 4, comentarios: 'Se conserva' }),
    { estado: 'Terminado', horas: 6.5, fecha_fin: '2026-08-26' },
  );
  assert.equal(manualEdit.ok, true);
  assert.equal(manualEdit.game.estado, 'Terminado');
  assert.equal(manualEdit.game.horas, 6.5);
  assert.equal(manualEdit.game.comentarios, 'Se conserva');
  assert.match(manualEdit.game.actualizado_en, /^\d{4}-\d{2}-\d{2}T/);

  const technicalEdit = applyManualGamePatch(game(), {
    launcher: 'Epic Games', plataforma: 'PC', tamano: '30.32 GB',
    lanzamiento: 2024, steam_appid: 123456, hltb_match: 'Test Game',
  });
  assert.equal(technicalEdit.ok, true);
  assert.equal(technicalEdit.game.launcher, 'Epic Games');
  assert.equal(technicalEdit.game.plataforma, 'PC');
  assert.equal(technicalEdit.game.tamano, '30.32 GB');
  assert.equal(technicalEdit.game.lanzamiento, 2024);
  assert.equal(technicalEdit.game.steam_appid, 123456);
  assert.equal(technicalEdit.game.hltb_match, 'Test Game');

  const correctedSteamId = applyManualGamePatch(game({
    steam_appid: 10,
    steam_store_name: 'Nombre anterior',
    steam_store_genres: ['Acción'],
    steam_last_sync_at: '2026-08-20T12:00:00.000Z',
  }), { steam_appid: 20 });
  assert.equal(correctedSteamId.ok, true);
  assert.equal(correctedSteamId.game.steam_appid, 20);
  assert.equal(correctedSteamId.game.steam_store_name, null);
  assert.equal(correctedSteamId.game.steam_store_genres, null);
  assert.equal(correctedSteamId.game.steam_last_sync_at, null);

  const invalidSteamId = applyManualGamePatch(game(), { steam_appid: 'abc' });
  assert.equal(invalidSteamId.ok, false);
  assert.equal(invalidSteamId.status, 400);

  const purchaseStoreEdit = applyManualGamePatch(game(), {
    tiendas_compra: ['Instang Gaming', 'Steam', 'Steam'],
  });
  assert.equal(purchaseStoreEdit.ok, true);
  assert.deepEqual(purchaseStoreEdit.game.tiendas_compra, ['Instant Gaming']);
  assert.deepEqual(getPurchaseStoreOptions('Nintendo Switch'), ['eShop', 'Instant Gaming']);

  const invalidAchievements = applyManualGamePatch(game(), {
    logros_actual: 11,
    logros_total: 10,
  });
  assert.equal(invalidAchievements.ok, false);
  assert.equal(invalidAchievements.status, 400);

  const catalogEdit = applyManualGamePatch(game({
    generos: ['Acción'],
    tags: ['transmitir'],
  }), {
    modos: ['solitario', 'transmision'],
    tags: ['indie', 'early-access'],
  });
  assert.equal(catalogEdit.ok, true);
  assert.deepEqual(catalogEdit.game.modos, ['solitario', 'transmision']);
  assert.deepEqual(catalogEdit.game.tags, ['indie', 'early-access']);
  assert.deepEqual(catalogEdit.game.generos, ['Acción']);

  assert.deepEqual(
    getGameGenres(['Acción', 'Free to Play', 'Acción']),
    ['Acción'],
  );
  const editedGenres = applyManualGamePatch(game(), {
    generos: ['Acción', 'Free to Play'],
  });
  assert.equal(editedGenres.ok, true);
  assert.deepEqual(editedGenres.game.generos, ['Acción']);

  const optionalHonoraryComment = applyManualGamePatch(game(), {
    critica: {
      ...fullCritique,
      criterios: { ...fullCritique.criterios, originalidad: 0 },
      mencion_honorifica: { nivel: 2, comentario: null },
    },
  });
  assert.equal(optionalHonoraryComment.ok, true);
  assert.equal(optionalHonoraryComment.game.critica.criterios.originalidad, 0);
  assert.equal(optionalHonoraryComment.game.critica.mencion_honorifica.nivel, 2);
  assert.equal(optionalHonoraryComment.game.critica.mencion_honorifica.comentario, null);

  const personalReview = applyManualGamePatch(game({
    critica: { metascore: 88, userscore: 8.4 },
  }), {
    critica_personal: {
      criterios: fullCritique.criterios,
      mencion_honorifica: { nivel: 1, comentario: 'Mi apunte' },
    },
  });
  assert.equal(personalReview.ok, true);
  assert.equal(personalReview.game.critica.metascore, 88);
  assert.equal(personalReview.game.critica.userscore, 8.4);
  assert.equal(personalReview.game.critica.criterios.jugabilidad, fullCritique.criterios.jugabilidad);
  assert.equal(personalReview.game.critica.mencion_honorifica.comentario, 'Mi apunte');

  const pendingReport = getDataCompleteness([
    game({ estado: 'Terminado', horas: 12, fecha_inicio: '2026-01-01', fecha_fin: '2026-01-02', nota: null }),
  ]);
  assert.deepEqual(pendingReport.games[0].missing.map((gap) => gap.key), ['nota']);
  assert.equal(pendingReport.games[0].missing[0].editor, 'review');

  const metadataDoesNotBlock = getDataCompleteness([
    game({ generos: null, modos: null, lanzamiento: null }),
  ]);
  assert.equal(metadataDoesNotBlock.incompleteGames, 0);

  const zeroScoreReview = applyManualGamePatch(game({ tags: ['competitivo'] }), {
    critica: {
      criterios: {
        jugabilidad: 0, historia: 0, musica: 0, graficos_arte: 0,
        entretenimiento: 0, originalidad: 0, comunidad: 0,
      },
      mencion_honorifica: { nivel: 0, comentario: null },
    },
  });
  assert.equal(zeroScoreReview.ok, true);
  assert.equal(zeroScoreReview.game.critica.criterios.jugabilidad, 0);
  assert.equal(zeroScoreReview.game.critica.criterios.musica, 0);
  assert.equal(zeroScoreReview.game.critica.criterios.comunidad, 0);
  assert.equal(zeroScoreReview.game.nota, 0);

  console.log('game-finance: cálculos y edición manual verificados');
} finally {
  await server.close();
}
