import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true } });
const originalFetch = globalThis.fetch;
const libraryBefore = await readFile('games.json', 'utf8');
try {
  const { toRouletteGame } = await server.ssrLoadModule('/src/lib/roulette-game.ts');
  const { isSteamAppId, parseSteamGameCredits, getSteamGameCredits } = await server.ssrLoadModule('/src/lib/steam-game-credits.ts');
  const fixture = { titulo: 'Un juego', lanzamiento: 2017, estado: 'Abandonado', generos: ['Acción'] };
  assert.equal(toRouletteGame(fixture).lanzamiento, 2017);
  assert.equal(toRouletteGame({ ...fixture, lanzamiento: null }).lanzamiento, null);
  assert.equal(toRouletteGame({ titulo: 'Sin año' }).lanzamiento, undefined);
  assert.equal(fixture.lanzamiento, 2017);

  for (const invalid of [undefined, null, '381210', 0, -1, 1.5, NaN, Infinity, 0x100000000]) {
    assert.equal(isSteamAppId(invalid), false);
  }
  assert.equal(isSteamAppId(381210), true);
  const storePayload = (appId, data) => ({ [appId]: { success: true, data } });
  assert.deepEqual(parseSteamGameCredits(storePayload(381210, {
    developers: [' Behaviour Interactive Inc. ', '', 'Behaviour Interactive Inc.', 4],
    publishers: ['Behaviour Interactive Inc.', 'Otro editor'],
    short_description: '<b>No devolver HTML de la tienda</b>',
  }), 381210), {
    developers: ['Behaviour Interactive Inc.'], publishers: ['Behaviour Interactive Inc.', 'Otro editor'],
  });
  assert.deepEqual(parseSteamGameCredits(storePayload(381210, {}), 381210), { developers: [], publishers: [] });
  for (const invalid of [null, {}, { 381210: { success: false } }, { 381210: { success: true, data: null } }]) {
    assert.equal(parseSteamGameCredits(invalid, 381210), null);
  }
  assert.equal(parseSteamGameCredits(storePayload(10, {}), 381210), null);

  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    const target = new URL(url);
    assert.equal(target.origin, 'https://store.steampowered.com');
    assert.equal(target.pathname, '/api/appdetails');
    assert.ok(options.signal instanceof AbortSignal, 'Steam requests have a timeout');
    const appId = target.searchParams.get('appids');
    return Response.json(storePayload(appId, { developers: ['Estudio de prueba'], publishers: ['Editora de prueba'] }));
  };
  const [first, concurrent] = await Promise.all([getSteamGameCredits(900001), getSteamGameCredits(900001)]);
  assert.deepEqual(first, concurrent);
  assert.equal(calls, 1, 'Concurrent requests reuse the same Steam fetch');
  await getSteamGameCredits(900001);
  assert.equal(calls, 1, 'Credits are cached');
  assert.equal(await getSteamGameCredits(0), null);
  assert.equal(calls, 1, 'Invalid app IDs never reach Steam');

  const { GET } = await server.ssrLoadModule('/src/pages/api/games/[slug]/info.ts');
  assert.equal((await GET({ params: { slug: '__missing-roulette-test__' } })).status, 404);
  const detail = await GET({ params: { slug: 'dead-by-daylight' } });
  assert.equal(detail.status, 200);
  assert.equal(detail.headers.get('Cache-Control'), 'no-store', 'A corrected AppID cannot reuse a stale CDN response');
  assert.deepEqual(await detail.json(), { developers: ['Estudio de prueba'], publishers: ['Editora de prueba'] });

  const { readGames, slugifyGameTitle } = await server.ssrLoadModule('/src/lib/local-games.ts');
  const noSteam = (await readGames()).find(game => !isSteamAppId(game.steam_appid));
  assert.ok(noSteam, 'Library contains a game without a Steam source');
  const previousCalls = calls;
  const noSource = await GET({ params: { slug: slugifyGameTitle(noSteam.titulo) } });
  assert.deepEqual(await noSource.json(), { developers: [], publishers: [] });
  assert.equal(calls, previousCalls);

  globalThis.fetch = async () => { throw new Error('Network unavailable'); };
  assert.equal(await getSteamGameCredits(900002), null, 'Network errors degrade to missing metadata');
  globalThis.fetch = async () => new Response('Rate limited', { status: 429 });
  assert.equal(await getSteamGameCredits(900003), null);
  globalThis.fetch = async () => new Response('Not JSON');
  assert.equal(await getSteamGameCredits(900004), null);
  assert.equal(await readFile('games.json', 'utf8'), libraryBefore, 'Reading credits must not mutate the library');
  console.log('roulette: release year, missing data, Steam credits, cache, API errors and read-only library verified');
} finally {
  globalThis.fetch = originalFetch;
  await server.close();
}
