import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { getDetailGroupLayout } = await server.ssrLoadModule('/src/lib/game-detail-layout.ts');
  const { getGoldenCompletionKind } = await server.ssrLoadModule('/src/lib/game-achievements.ts');
  const { getEconomicHoursGoal } = await server.ssrLoadModule('/src/lib/game-hours-goal.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const game = { titulo: 'Goal fixture', precio_pagado: 100, horas: 50, nota: 10 };
  const metrics = getGameValueMetrics(game);
  const before = structuredClone(metrics);
  assert.deepEqual(getEconomicHoursGoal(metrics), {
    state: 'in-progress', actualHours: 50, targetHours: 90.91,
    remainingHours: 40.91, progressPercent: 55,
  });
  assert.deepEqual(metrics, before, 'Goal presentation never mutates the financial calculation');
  const goal = patch => getEconomicHoursGoal(getGameValueMetrics({ ...game, ...patch }));
  assert.equal(goal({ horas: 0 }).progressPercent, 0, 'Recorded zero is genuine progress');
  assert.equal(goal({ horas: 0 }).state, 'in-progress');
  assert.equal(goal({ horas: 800.6 }).progressPercent, 100, 'Extra hours do not enlarge the scale');
  assert.equal(goal({ horas: 800.6 }).state, 'achieved');
  assert.equal(goal({ horas: 100, nota: null }).state, 'achieved', 'Exact target is reached');
  assert.equal(goal({ horas: 99.96, nota: null }).state, 'in-progress');
  assert.equal(goal({ horas: 99.96, nota: null }).progressPercent, 99, 'No premature 100% through rounding');
  for (const horas of [null, undefined, '', NaN, Infinity, -1]) {
    assert.equal(goal({ horas }).state, 'missing-hours');
    assert.equal(goal({ horas }).progressPercent, null);
  }
  for (const precio_pagado of [null, undefined, -1]) {
    assert.equal(goal({ precio_pagado }).state, 'incomplete');
    assert.equal(goal({ precio_pagado }).progressPercent, null);
  }
  assert.equal(goal({ precio_pagado: 0 }).state, 'no-cost');
  assert.equal(goal({ precio_pagado: 0 }).progressPercent, null, 'No artificial bar when there is no expense');
  assert.equal(goal({ precio_pagado: 0, horas: null }).state, 'no-cost');
  const f2p = goal({ tags: ['free-to-play'], gasto_microtransacciones: 200 });
  assert.equal(f2p.state, 'in-progress', 'Free-to-play purchases still need amortization');
  assert.equal(f2p.targetHours, 181.82);
  const missingDlc = goal({ dlcs: { items: [{ titulo: 'DLC', fecha_adquisicion: '2026-01-01', precio_pagado: null }] } });
  assert.equal(missingDlc.state, 'incomplete');
  assert.equal(missingDlc.targetHours, null);
  assert.equal(goal({ horas_estimadas: true }).progressPercent, 55);
  const item = (state, value = '-') => ({ label: 'Dato', value, state });
  assert.equal(getDetailGroupLayout([]).state, 'not-applicable');
  assert.equal(getDetailGroupLayout([item('not-applicable')]).visibleItems.length, 0);
  assert.equal(getDetailGroupLayout([item('empty'), item('empty')]).state, 'empty');
  assert.equal(getDetailGroupLayout([item('complete', '100%'), item('empty')]).state, 'partial');
  assert.equal(getDetailGroupLayout([item('default', '0'), item('default', 'PC')]).state, 'complete');
  const steam = [item('default', '4 / 10'), item('default', 'Normal'), item('empty')];
  const noSteam = [...steam.slice(0, 2), item('not-applicable')];
  assert.equal(getDetailGroupLayout(steam).visibleItems.length, 3);
  assert.equal(getDetailGroupLayout(noSteam).visibleItems.length, 2);
  assert.equal(getDetailGroupLayout(noSteam).state, 'complete');
  assert.equal(noSteam.length, 3, 'Presentation must not mutate source data');
  assert.equal(getGoldenCompletionKind({ logros: { actual: 49, total: 49 } }), 'achievements');
  assert.equal(getGoldenCompletionKind({ partidas_al_100: 1 }), 'game');
  assert.equal(getGoldenCompletionKind({ logros: { actual: 0, total: 10 } }), null);
  assert.equal(getGoldenCompletionKind({ logros: { actual: null, total: null } }), null);
  console.log('detail: cobertura, cero, vacío, Steam/no Steam y criterio Golden verificados');
} finally {
  await server.close();
}
