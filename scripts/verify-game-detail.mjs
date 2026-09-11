import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { getDetailGroupLayout } = await server.ssrLoadModule('/src/lib/game-detail-layout.ts');
  const { getGoldenCompletionKind } = await server.ssrLoadModule('/src/lib/game-achievements.ts');
  const { getHoursComparisonPoints } = await server.ssrLoadModule('/src/lib/game-hours-view.ts');
  assert.deepEqual(getHoursComparisonPoints({ myHours: null }), []);
  assert.deepEqual(getHoursComparisonPoints({ myHours: 0 }), [{ label: 'Mis horas', value: 0, kind: 'personal' }]);
  const hoursPayload = { myHours: 800.6, benchmarkBars: [{ label: 'Amortización', value: 134.42 }] };
  assert.deepEqual(getHoursComparisonPoints(hoursPayload).map(point => point.value), [800.6, 134.42]);
  assert.equal(hoursPayload.benchmarkBars.length, 1, 'Comparison does not mutate stored references');
  assert.equal(getHoursComparisonPoints({ myHours: 4.6, myHoursLabel: 'Horas estimadas' })[0].label, 'Horas estimadas');
  assert.deepEqual(getHoursComparisonPoints({ benchmarkBars: [{ label: 'Nulo', value: null }, { label: 'Inválido', value: NaN }, { label: 'Negativo', value: -1 }] }), []);
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
