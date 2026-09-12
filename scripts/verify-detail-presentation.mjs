import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { getDlcPriceComparison, getGameMarketView } = await server.ssrLoadModule('/src/lib/game-market-view.ts');
  const { getPriceBalance, formatSignedEuro, formatSignedPercent, parsePrice } = await server.ssrLoadModule('/src/lib/price-balance.ts');
  const { getDlcCardView } = await server.ssrLoadModule('/src/lib/game-dlc-view.ts');
  const { applyManualDlcPatch } = await server.ssrLoadModule('/src/lib/manual-dlc-edit.ts');
  const { getGamePill } = await server.ssrLoadModule('/src/lib/game-pill.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const fixtures = [
    { titulo: 'Known', precio_pagado: 10, precio_actual: 5 },
    { titulo: 'Free', precio_pagado: 0, precio_actual: 3 },
    { titulo: 'Missing paid', fecha_adquisicion: '2026-01-01', precio_pagado: null, precio_actual: 50 },
    { titulo: 'Missing current', precio_pagado: 20, precio_actual: null },
    { titulo: 'Unowned', precio_actual: 100 },
  ];
  const paired = getDlcPriceComparison(fixtures);
  assert.equal(paired.acquiredCount, 4); assert.equal(paired.excludedCount, 2);
  assert.equal(paired.rows.length, 2); assert.equal(paired.paidTotal, 10); assert.equal(paired.currentTotal, 8);
  assert.equal(paired.difference, -2); assert.equal(paired.pendingCount, 1); assert.equal(paired.pendingTotal, 100);
  assert.deepEqual(paired.balance, { state: 'loss', difference: -2, percent: -20 });
  assert.equal(paired.rows[0].balance.state, 'loss');
  assert.equal(paired.rows[1].balance.percent, null);
  assert.deepEqual(getPriceBalance(104.5, 69.92), { state: 'loss', difference: -34.58, percent: -33.1 });
  assert.deepEqual(getPriceBalance(20, 30), { state: 'gain', difference: 10, percent: 50 });
  assert.deepEqual(getPriceBalance(10, 10), { state: 'neutral', difference: 0, percent: 0 });
  assert.deepEqual(getPriceBalance(0, 3), { state: 'gain', difference: 3, percent: null });
  assert.deepEqual(getPriceBalance(0, 0), { state: 'neutral', difference: 0, percent: null });
  assert.deepEqual(getPriceBalance(10, 0), { state: 'loss', difference: -10, percent: -100 });
  assert.equal(getPriceBalance(null, 10).state, 'unavailable');
  for (const invalid of [NaN, Infinity, -1]) assert.equal(getPriceBalance(invalid, 10).state, 'unavailable');
  assert.match(formatSignedEuro(-34.58), /^−34,58\s€$/);
  assert.match(formatSignedEuro(10), /^\+10,00\s€$/);
  assert.equal(formatSignedEuro(null), 'Sin comparar');
  assert.equal(formatSignedPercent(-33.1), '−33,1 %');
  assert.equal(formatSignedPercent(null), 'Sin coste inicial');
  assert.equal(parsePrice(' 0 '), 0);
  const noDate = getDlcCardView({ titulo: 'Example: Expansion', precio_pagado: 0, precio_actual: 5 }, 'Example');
  assert.equal(noDate.owned, true); assert.equal(noDate.dateLabel, 'Fecha sin registrar');
  assert.equal(noDate.title, 'Expansion'); assert.equal(noDate.fullTitle, 'Example: Expansion');
  assert.equal(noDate.balance.state, 'gain'); assert.equal(noDate.balance.percent, null);
  const unowned = getDlcCardView({ titulo: 'Not mine', precio_actual: 0 });
  assert.equal(unowned.owned, false); assert.equal(unowned.balance.state, 'unavailable'); assert.equal(unowned.current, 0);
  const knownDate = getDlcCardView({ titulo: 'DEAD BY DAYLIGHT - Resident Evil', fecha_adquisicion: '2023-07-05', precio_pagado: 8.39, precio_actual: 3.49 }, 'Dead by Daylight');
  assert.equal(knownDate.title, 'Resident Evil'); assert.equal(knownDate.owned, true);
  assert.equal(knownDate.dateLabel, '05 jul 2023'); assert.equal(knownDate.balance.difference, -4.9);
  assert.equal(getDlcCardView({ titulo: 'Example Elsewhere' }, 'Example').title, 'Example Elsewhere');
  assert.equal(getDlcCardView({ titulo: 'Example' }, 'Example').title, 'Example');
  assert.equal(getDlcCardView({ titulo: 'No price', fecha_adquisicion: '2023-01-01', precio_actual: 8 }).balance.state, 'unavailable');
  const today = '2026-09-12';
  for (const paid of [0, 8.39]) {
    const item = { titulo: 'Owned without date', fecha_adquisicion: null, precio_pagado: paid, precio_actual: 3, cover_url: 'https://example.com/cover.jpg' };
    const edited = applyManualDlcPatch(item, { owned: true, fecha_adquisicion: '', precio_pagado: String(paid) }, today);
    assert.equal(edited.fecha_adquisicion, null); assert.equal(edited.precio_pagado, paid);
    assert.equal(edited.precio_actual, item.precio_actual); assert.equal(edited.cover_url, item.cover_url);
    assert.equal(item.fecha_adquisicion, null);
    assert.equal(applyManualDlcPatch(item, null, today), item);
    assert.equal(applyManualDlcPatch(item, { owned: true, fecha_adquisicion: '2023-07-05', precio_pagado: paid }, today).fecha_adquisicion, '2023-07-05');
    const removed = applyManualDlcPatch(item, { owned: false }, today);
    assert.equal(removed.precio_pagado, null); assert.equal(removed.fecha_adquisicion, null); assert.equal(removed.precio_actual, 3);
  }
  assert.equal(applyManualDlcPatch({ titulo: 'New' }, { owned: true, precio_pagado: 0 }, today).fecha_adquisicion, today);
  assert.equal(applyManualDlcPatch({ titulo: 'Existing', fecha_adquisicion: '2020-01-01' }, { owned: true, precio_pagado: '' }, today).fecha_adquisicion, '2020-01-01');
  assert.equal(getDlcPriceComparison().paidTotal, null);
  assert.equal(getDlcPriceComparison([{ titulo: 'Zero', precio_pagado: 0, precio_actual: 0 }]).currentTotal, 0);
  for(const invalid of [null, undefined, '', ' ', -1, NaN, Infinity, false]) {
    assert.equal(getDlcPriceComparison([{titulo:'Unknown',fecha_adquisicion:'2026-01-01',precio_pagado:invalid,precio_actual:5}]).rows.length,0);
  }
  const base = { titulo: 'Example', estado: 'Jugando', launcher: 'Steam', plataforma: 'PC', horas: 10, precio_pagado: 9.99, precio_salida: 19.99, precio_actual: 19.99, precio_minimo_historico: 4.99 };
  const market = getGameMarketView(base);
  assert.deepEqual(market.points.map(p=>p.kind), ['launch','purchase','current']);
  assert.equal(market.points[1].label, 'Mi compra'); assert.equal(market.points[1].value, 9.99);
  assert.equal(market.historicLow, 4.99); assert.equal(market.points.length, 3);
  assert.equal(getGameMarketView({...base,precio_pagado:null}).points.some(p=>p.kind==='purchase'),false);
  assert.equal(getGameMarketView({...base,precio_pagado:0}).points[1].value,0);
  const incomplete = getGameValueMetrics({...base,dlcs:{items:fixtures}});
  assert.equal(incomplete.dataComplete,false); assert.equal(incomplete.economicTargetRealHours,39.99);
  assert.equal(incomplete.usageProvisional,true);
  const complete = getGameValueMetrics({...base,precio_pagado:100,horas:100,nota:10});
  assert.equal(complete.scoreMultiplier,1.1); assert.equal(complete.economicTargetRealHours,90.91);
  assert.match(getGamePill('status','  COMPLETADO ').className,/badge-status-completed/);
  assert.match(getGamePill('tag','free to play').className,/badge-tag-free/);
  assert.equal(getGamePill('tag','free-to-play').label,'Free to Play');
  assert.match(getGamePill('launcher','Steam').content,/launcher-inline-icon/);
  assert.equal(getGamePill('platform','PC').content,'<span>PC</span>');
  const completion = getGamePill('achievement', '100% de logros completados', '100%');
  assert.equal(completion.label, '100%');
  assert.equal(completion.content, '<span>100%</span>');
  assert.match(completion.className, /badge-achievement-platinum/);
  assert.equal(getGamePill('neutral','<img src=x onerror=alert(1)>').content,'<span>&lt;img src=x onerror=alert(1)&gt;</span>');
  assert.match(getGamePill('launcher','<script>x</script>').className,/badge-launcher-default/);
  console.log('Detail presentation: paired DLC cohorts, null/zero, price references, amortization and shared safe pills PASSED.');
} finally { await server.close(); }
