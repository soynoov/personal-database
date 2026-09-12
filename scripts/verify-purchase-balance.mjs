import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { getGameMarketView } = await server.ssrLoadModule('/src/lib/game-market-view.ts');
  const { getGameValueMetrics, getGameProfitabilityStatus } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const { getEconomicHoursGoal } = await server.ssrLoadModule('/src/lib/game-hours-goal.ts');
  const game = { titulo: 'Fixture', estado: 'Jugando', precio_pagado: 10, precio_actual: 20, precio_salida: 30, horas: 100 };
  const view = patch => getGameMarketView({ ...game, ...patch });
  const usage = patch => getGameValueMetrics({ ...game, ...patch });
  const goal = patch => getEconomicHoursGoal(usage(patch));
  const missing = { titulo: 'Incomplete', fecha_adquisicion: '2026-01-01', precio_pagado: null, precio_actual: 5 };
  const pairedDlc = { titulo: 'Paired', precio_pagado: 30, precio_actual: 15 };

  // Snapshot fixture specified in the design plan; never reads or overwrites games.json.
  const dbd = { ...game, titulo: 'Dead by Daylight', precio_pagado: 9.99, precio_actual: 19.99,
    horas: 771.5, nota: 3.7, gasto_microtransacciones: 5,
    dlcs: { items: [
      ...Array.from({ length: 17 }, (_, i) => ({ titulo: `Comparable ${i + 1}`, precio_pagado: 5, precio_actual: 3 })),
      { titulo: 'Comparable 18', precio_pagado: 19.5, precio_actual: 18.92 },
      ...Array.from({ length: 4 }, (_, i) => ({ ...missing, titulo: `Pending ${i + 1}` })),
      { titulo: 'Unowned', precio_actual: 500 },
    ] } };
  const before = structuredClone(dbd);
  const market = getGameMarketView(dbd), metrics = getGameValueMetrics(dbd);
  assert.equal(market.purchaseBalance.paidTotal, 114.49);
  assert.equal(market.purchaseBalance.currentTotal, 89.91);
  assert.deepEqual(market.purchaseBalance.balance, { state: 'loss', difference: -24.58, percent: -21.5 });
  assert.equal(market.baseBalance.difference, 10);
  assert.equal(market.dlcs.balance.difference, -34.58);
  assert.equal(market.purchaseBalance.partial, true);
  assert.equal(market.purchaseBalance.excludedCount, 4);
  assert.equal(metrics.recordedSpend, 119.49);
  assert.equal(metrics.economicTargetRealHours, 119.49);
  assert.equal(metrics.costPerRealHour, 0.15);
  assert.equal(metrics.economicMultiple, 6.46);
  assert.equal(getEconomicHoursGoal(metrics).state, 'achieved');
  assert.equal(getEconomicHoursGoal(metrics).provisional, true);
  assert.equal(getGameProfitabilityStatus(dbd), 'incomplete', 'Catalogue criteria are preserved');
  assert.deepEqual(dbd, before, 'Presentation does not mutate source data');

  assert.deepEqual(view({}).purchaseBalance.balance, { state: 'gain', difference: 10, percent: 100 });
  assert.deepEqual(view({ precio_actual: 5 }).purchaseBalance.balance, { state: 'loss', difference: -5, percent: -50 });
  assert.deepEqual(view({ precio_actual: 10 }).purchaseBalance.balance, { state: 'neutral', difference: 0, percent: 0 });
  assert.equal(view({ precio_actual: 5 }).purchaseComparison.direction, 'premium', 'Compare against current, not launch');
  const copies = view({ unidades_compradas: 3 });
  assert.equal(copies.purchaseBalance.paidTotal, 30); assert.equal(copies.purchaseBalance.currentTotal, 60);
  assert.equal(copies.baseBalance.difference, 30); assert.equal(copies.baseUnitBalance.difference, 10);
  assert.equal(usage({ unidades_compradas: 3 }).recordedSpend, 30);
  const aggregate = view({ dlcs: { items: [pairedDlc] } }).purchaseBalance;
  assert.equal(aggregate.balance.difference, -5);
  assert.equal(aggregate.balance.percent, -12.5, 'Percent uses aggregate cost, never adds percentages');
  assert.equal(view({ gasto_microtransacciones: 500 }).purchaseBalance.balance.difference, 10);
  assert.equal(usage({ gasto_microtransacciones: 500 }).recordedSpend, 510);

  assert.equal(view({ horas: null }).purchaseBalance.balance.difference, 10);
  assert.equal(goal({ horas: null }).state, 'missing-hours');
  assert.equal(goal({ horas: 0 }).state, 'in-progress');
  assert.equal(goal({ precio_pagado: 0 }).state, 'no-cost');
  assert.deepEqual(view({ precio_pagado: 0 }).purchaseBalance.balance, { state: 'gain', difference: 20, percent: null });
  assert.deepEqual(view({ precio_pagado: 0, precio_actual: 0 }).purchaseBalance.balance, { state: 'neutral', difference: 0, percent: null });
  const zeroPending = { precio_pagado: 0, dlcs: { items: [missing] } };
  assert.equal(goal(zeroPending).state, 'incomplete');
  assert.equal(goal(zeroPending).progressPercent, null);
  assert.equal(usage(zeroPending).costPerRealHour, null);
  assert.equal(usage(zeroPending).canCalculateUsage, false);
  const partial = usage({ dlcs: { items: [missing, { titulo: 'No reference', precio_pagado: 30 }] } });
  assert.equal(partial.recordedSpend, 40); assert.equal(partial.economicTargetRealHours, 40);
  assert.equal(partial.usageProvisional, true);
  assert.equal(usage({ dlcs: { items: [{ titulo: 'No reference', precio_pagado: 30 }] } }).usageProvisional, false, 'Missing current price does not block usage');
  assert.equal(goal({ dlcs: { items: [missing] } }).provisional, true);
  assert.equal(goal({ dlcs: { items: [{ ...missing, precio_pagado: 200 }] } }).state, 'in-progress', 'Filling a cost updates the goal');
  assert.equal(goal({ dlcs: { items: [{ ...missing, precio_pagado: 200 }] } }).provisional, false);
  assert.equal(usage({ nota: 10 }).scoreMultiplier, 1.1);
  assert.equal(usage({ nota: 10, dlcs: { items: [missing] } }).economicTargetRealHours, 9.09);

  const baseMissing = view({ precio_pagado: null, dlcs: { items: [pairedDlc] } });
  assert.equal(baseMissing.purchaseBalance.paidTotal, 30); assert.equal(baseMissing.purchaseBalance.partial, true);
  assert.equal(baseMissing.purchaseBalance.baseIncluded, false);
  assert.equal(view({ precio_actual: null }).purchaseBalance.balance.state, 'unavailable');
  assert.equal(view({ estado: null, precio_pagado: null }).baseApplicable, true);
  assert.equal(view({ estado: '  WISHLIST ', precio_pagado: null }).baseApplicable, false);
  for (const invalid of [null, undefined, '', ' ', false, [], {}, NaN, Infinity, -1]) {
    assert.equal(view({ precio_pagado: invalid }).purchaseBalance.paidTotal, null);
    assert.equal(usage({ precio_pagado: invalid }).baseSpend, null);
  }
  const f2p = view({ tags: ['free-to-play'], dlcs: { items: [pairedDlc, { titulo: 'Unowned', precio_actual: 99 }] } });
  assert.equal(f2p.purchaseBalance.baseIncluded, false); assert.equal(f2p.purchaseBalance.paidTotal, 30);
  assert.equal(f2p.purchaseBalance.partial, false);
  assert.equal(view({ tags: ['free-to-play'] }).purchaseBalance.balance.state, 'unavailable');
  assert.equal(goal({ tags: ['free-to-play'], gasto_microtransacciones: 200 }).state, 'in-progress');
  console.log('Purchase balance: DBD, copies, paired cohorts, missing prices/hours, zero, provisional use and catalogue isolation PASSED.');
} finally { await server.close(); }
