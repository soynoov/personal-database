import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { getDlcPriceComparison, getGameMarketView } = await server.ssrLoadModule('/src/lib/game-market-view.ts');
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
  assert.equal(incomplete.dataComplete,false); assert.equal(incomplete.economicTargetRealHours,null);
  const complete = getGameValueMetrics({...base,precio_pagado:100,horas:100,nota:10});
  assert.equal(complete.scoreMultiplier,1.1); assert.equal(complete.economicTargetRealHours,90.91);
  assert.match(getGamePill('status','  COMPLETADO ').className,/badge-status-completed/);
  assert.match(getGamePill('tag','free to play').className,/badge-tag-free/);
  assert.equal(getGamePill('tag','free-to-play').label,'Free to Play');
  assert.match(getGamePill('launcher','Steam').content,/launcher-inline-icon/);
  assert.equal(getGamePill('platform','PC').content,'<span>PC</span>');
  assert.equal(getGamePill('neutral','<img src=x onerror=alert(1)>').content,'<span>&lt;img src=x onerror=alert(1)&gt;</span>');
  assert.match(getGamePill('launcher','<script>x</script>').className,/badge-launcher-default/);
  console.log('Detail presentation: paired DLC cohorts, null/zero, price references, amortization and shared safe pills PASSED.');
} finally { await server.close(); }
