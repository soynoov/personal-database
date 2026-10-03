import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { getGameHourEntries, getTotalGameHours, parseLauncherHours, scopeGameHoursToLauncher, updateLauncherMinutes, withComputedHours } from '../src/lib/game-hours.mjs';
import { validateGameLibrary } from '../src/lib/game-library.mjs';

const base = { titulo: 'Prueba', estado: 'Jugando', launcher: 'Epic Games', plataforma: 'PC', horas: 91 + 43 / 60, fecha_inicio: '2026-01-01', fecha_fin: null, precio_pagado: 10 };
const zzz = updateLauncherMinutes(updateLauncherMinutes(base, 'Epic Games', 5503), 'Steam', 3078);
assert.equal(getTotalGameHours(zzz) * 60, 8581);
assert.equal(getTotalGameHours(updateLauncherMinutes(zzz, 'Steam', 3138)) * 60, 8641);
assert.equal(updateLauncherMinutes(zzz, 'Steam', 3138).horas_por_launcher[0].minutos, 5503);
assert.equal(updateLauncherMinutes(zzz, 'steam', 3078).horas_por_launcher.length, 2);
assert.equal(getTotalGameHours({ horas: 99.96 }), 99.96, 'Legacy precision must not change until migrated');
assert.equal(getGameHourEntries({ launcher: 'Steam', horas: null })[0].minutos, null);
assert.equal(getTotalGameHours({ horas_por_launcher: [{ launcher: 'Steam', minutos: null }] }), null);
assert.equal(getTotalGameHours({ horas_por_launcher: [{ launcher: 'Steam', minutos: 0 }] }), 0);
assert.equal(withComputedHours({ ...zzz, horas: 999 }).horas * 60, 8581);
assert.equal(scopeGameHoursToLauncher(zzz, 'Steam').horas, 51.3);
assert.equal(scopeGameHoursToLauncher(zzz, 'GOG'), null);
for (const entries of [[], [{launcher:'Steam', minutos:-1}], [{launcher:'Steam', minutos:1.5}], [{launcher:'Steam', minutos:'1'}], [{launcher:'', minutos:1}], [{launcher:'Steam', minutos:0},{launcher:' steam ',minutos:1}]]) {
  assert.throws(() => parseLauncherHours(entries));
  assert.throws(() => validateGameLibrary([{ ...base, horas_por_launcher: entries }]));
}

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } });
try {
  const { applyManualGamePatch } = await server.ssrLoadModule('/src/lib/manual-game-edit.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  const { filterCatalogGames, toCatalogGame } = await server.ssrLoadModule('/src/lib/catalog-game.ts');
  const { getUniqueValues, getStats, filterGames, readBundledGames } = await server.ssrLoadModule('/src/lib/local-games.ts');
  const { getYearRecap } = await server.ssrLoadModule('/src/lib/recap.ts');
  assert.equal(getGameValueMetrics({ ...zzz, horas: 1 }).realHours * 60, 8581);
  const updated = applyManualGamePatch(zzz, { horas_launcher: { launcher: 'Steam', minutos: 3138 } });
  assert.equal(updated.ok, true);
  assert.equal(updated.game.horas_por_launcher[0].minutos, 5503);
  assert.equal(updated.game.horas * 60, 8641);
  assert.equal(applyManualGamePatch(zzz, { horas: 51.3 }).status, 409);
  assert.equal(applyManualGamePatch(zzz, { horas_launcher: { launcher: 'Steam', minutos: -1 } }).status, 400);
  assert.equal(applyManualGamePatch(zzz, { horas: 1, horas_por_launcher: zzz.horas_por_launcher }).status, 400);
  assert.equal(applyManualGamePatch(base, { horas: 99.96 }).game.horas, 99.96);
  assert.equal(applyManualGamePatch(base, { horas: 'abc' }).status, 400);
  assert.equal(applyManualGamePatch(zzz, { horas_por_launcher: zzz.horas_por_launcher, horas_por_launcher_base: updated.game.horas_por_launcher }).status, 409);
  assert.equal(applyManualGamePatch(zzz, { horas_por_launcher: zzz.horas_por_launcher, horas_por_launcher_base: zzz.horas_por_launcher }).ok, true);
  assert.equal(withComputedHours({ ...zzz, horas_por_launcher: [{ launcher: 'Steam', minutos: 60 }] }).launcher, 'Steam');
  assert.equal(applyManualGamePatch(zzz, { launcher: 'Steam' }).game.launcher, 'Steam');
  assert.equal(applyManualGamePatch(zzz, { launcher: 'GOG' }).status, 400);
  const catalog = toCatalogGame(zzz);
  for (const launcher of ['Epic Games', 'Steam']) {
    assert.equal(filterGames([zzz], { launcher }).length, 1);
    assert.equal(filterCatalogGames([catalog], { launcher }).length, 1);
  }
  assert.deepEqual(getUniqueValues([zzz], 'launcher'), ['Epic Games', 'Steam']);
  assert.equal(getStats([zzz]).total, 1);
  assert.equal(getStats([zzz]).horas, 143);
  assert.equal(getYearRecap([scopeGameHoursToLauncher(zzz, 'Steam')], 2026).horasAtribuidas, 51.3);
  const games = await readBundledGames();
  for (const [title, minutes] of [['Zenless Zone Zero', 8581], ['Satisfactory', 25482]]) {
    assert.equal(Math.round(games.find(game => game.titulo === title).horas * 60), minutes);
  }
  console.log('Horas verificadas: totales, legacy, filtros, estadísticas, validación y actualización independiente.');
} finally { await server.close(); }
