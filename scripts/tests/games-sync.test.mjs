import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import { BlobPreconditionFailedError } from '@vercel/blob';
import { GamesVersionConflictError, mergeGameAdditions, syncGameAdditions } from '../../src/lib/game-library.mjs';
import { createGameBlobStore } from '../../src/lib/game-blob-store.mjs';
import gamesSync from '../integrations/games-sync.mjs';

const game = (titulo, fields = {}) => ({ titulo, horas: 0, ...fields });

function memoryStore(initial = null, beforeWrite = () => {}) {
  let current = initial === null ? null : structuredClone(initial);
  let revision = 1;
  let writes = 0;
  let reads = 0;
  return {
    get games() { return structuredClone(current); },
    get writes() { return writes; },
    get reads() { return reads; },
    replace(games) { current = structuredClone(games); revision += 1; },
    async read() {
      reads += 1;
      return current === null ? null : { games: structuredClone(current), etag: String(revision) };
    },
    async write(games, etag) {
      writes += 1;
      await beforeWrite(this, writes);
      if ((current === null && etag !== null) || (current !== null && etag !== String(revision))) {
        throw new GamesVersionConflictError();
      }
      this.replace(games);
      return String(revision);
    },
  };
}

test('imports new games without changing any existing remote field or remote-only game', async () => {
  const existing = game('Rivals', { horas: 241, logros: { actual: 49, total: 49 }, comentarios: 'Online', dlcs: { items: [{ titulo: 'DLC', notas: 'Keep' }] } });
  const store = memoryStore([existing, game('Solo online')]);
  const source = [game('Rivals', { horas: 1, logros: { actual: 0, total: 49 } }), game('Nuevo')];
  const before = structuredClone(source);
  const result = await syncGameAdditions(source, store);
  assert.deepEqual(result.added, ['Nuevo']);
  assert.deepEqual(store.games, [existing, game('Solo online'), game('Nuevo')]);
  assert.deepEqual(source, before);
  assert.equal(store.writes, 1);
});

test('is idempotent and local deletions/edits never overwrite Blob', async () => {
  const store = memoryStore([game('Uno', { horas: 30 }), game('Dos')]);
  const result = await syncGameAdditions([game('Uno')], store);
  assert.deepEqual(result.added, []);
  assert.equal(result.total, 2);
  assert.equal(store.writes, 0);
});

test('dry run reports additions without writing', async () => {
  const store = memoryStore([game('Uno')]);
  const result = await syncGameAdditions([game('Uno'), game('Dos')], store, { dryRun: true });
  assert.deepEqual(result, { added: ['Dos'], total: 2, dryRun: true });
  assert.equal(store.writes, 0);
});

test('creates a missing store with a create-only version and is then idempotent', async () => {
  const store = memoryStore();
  await syncGameAdditions([game('Uno')], store);
  await syncGameAdditions([game('Uno')], store);
  assert.equal(store.writes, 1);
  assert.deepEqual(store.games, [game('Uno')]);
});

test('re-reads and preserves an online edit that races with the import', async () => {
  const store = memoryStore([game('Uno')], (target, attempt) => {
    if (attempt === 1) target.replace([game('Uno', { horas: 88 }), game('Online')]);
  });
  await syncGameAdditions([game('Uno'), game('Dos')], store);
  assert.equal(store.reads, 2);
  assert.equal(store.writes, 2);
  assert.deepEqual(store.games, [game('Uno', { horas: 88 }), game('Online'), game('Dos')]);
});

test('a concurrent initial creation cannot be overwritten', async () => {
  const store = memoryStore(null, (target, attempt) => {
    if (attempt === 1) target.replace([game('Online', { horas: 2 })]);
  });
  await syncGameAdditions([game('Local')], store);
  assert.deepEqual(store.games, [game('Online', { horas: 2 }), game('Local')]);
});

test('two concurrent imports of the same game do not duplicate it', async () => {
  const store = memoryStore([game('Uno')], (target, attempt) => {
    if (attempt === 1) target.replace([game('Uno'), game('Dos', { horas: 100 })]);
  });
  const result = await syncGameAdditions([game('Uno'), game('Dos')], store);
  assert.deepEqual(result.added, []);
  assert.equal(store.writes, 1);
  assert.equal(store.games[1].horas, 100);
});

test('persistent version conflicts fail after three attempts, without blind overwrite', async () => {
  const store = memoryStore([game('Uno')], (target) => target.replace([game('Uno', { horas: 7 })]));
  await assert.rejects(syncGameAdditions([game('Dos')], store), GamesVersionConflictError);
  assert.equal(store.writes, 3);
  assert.deepEqual(store.games, [game('Uno', { horas: 7 })]);
});

test('network/auth errors propagate without retries or losing remote data', async () => {
  const store = memoryStore([game('Uno')], () => { throw new Error('Unavailable'); });
  await assert.rejects(syncGameAdditions([game('Dos')], store), /Unavailable/);
  assert.equal(store.writes, 1);
  assert.deepEqual(store.games, [game('Uno')]);
});

test('matches the same accent/case/punctuation-insensitive identity as game routes', () => {
  const result = mergeGameAdditions([game('Pokémon: Azul')], [game('pokemon azul', { horas: 55 })]);
  assert.deepEqual(result.added, []);
  assert.equal(result.games[0].horas, 55);
});

test('refuses malformed or duplicate local titles before accessing storage', async () => {
  for (const invalid of [{}, [null], [game('')], [game('UNO'), game('uno')]]) {
    const store = memoryStore([]);
    await assert.rejects(syncGameAdditions(invalid, store));
    assert.equal(store.reads, 0);
    assert.equal(store.writes, 0);
  }
});

test('refuses corrupt remote data and never writes over it', async () => {
  const store = memoryStore([game('Uno'), game('Uno')]);
  await assert.rejects(syncGameAdditions([game('Dos')], store), /duplicado/);
  assert.equal(store.writes, 0);
});

test('Blob adapter refuses unversioned writes before making a network request', async () => {
  await assert.rejects(createGameBlobStore().write([game('Uno')], undefined), /leer la versión/);
});

test('Blob adapter reads without cache and writes with the strong ETag it read', async () => {
  const source = [game('Uno')];
  const store = createGameBlobStore({ token: 'fixture' }, {
    async get(blobPath, options) {
      assert.equal(blobPath, 'personal-database/games.json');
      assert.equal(options.useCache, false);
      return { statusCode: 200, stream: new Response(JSON.stringify(source)).body, blob: { etag: 'W/"v1"' } };
    },
    async put(blobPath, body, options) {
      assert.equal(blobPath, 'personal-database/games.json');
      assert.deepEqual(JSON.parse(body), source);
      assert.equal(options.ifMatch, '"v1"');
      assert.equal(options.allowOverwrite, true);
      assert.equal(options.access, 'private');
      assert.equal(options.addRandomSuffix, false);
      return { etag: '"v2"' };
    },
  });
  const snapshot = await store.read();
  assert.equal(await store.write(snapshot.games, snapshot.etag), '"v2"');
});

test('Blob creation forbids overwrite and an existing Blob becomes a version conflict', async () => {
  const store = createGameBlobStore({}, {
    async put(_path, _body, options) {
      assert.equal(options.allowOverwrite, false);
      assert.equal(Object.hasOwn(options, 'ifMatch'), false);
      throw new Error('Blob already exists');
    },
    async get() {
      return { statusCode: 200, stream: new Response(JSON.stringify([game('Online')])).body, blob: { etag: '"v1"' } };
    },
  });
  await assert.rejects(store.write([game('Local')], null), GamesVersionConflictError);
});

test('SDK precondition failures use the same conflict type as the editor and importer', async () => {
  const store = createGameBlobStore({}, { put: async () => { throw new BlobPreconditionFailedError(); } });
  await assert.rejects(store.write([game('Uno')], '"v1"'), GamesVersionConflictError);
});

test('malformed Blob responses are rejected instead of treated as an empty library', async () => {
  const store = createGameBlobStore({}, {
    async get() { return { statusCode: 200, stream: new Response('{}').body, blob: { etag: '"v1"' } }; },
  });
  await assert.rejects(store.read(), /lista de juegos/);
});

const logger = () => ({ infos: [], errors: [], info(message) { this.infos.push(message); }, error(message) { this.errors.push(message); }, warn(message) { this.errors.push(message); } });

test('production builds sync automatically, while local and preview builds do not', async () => {
  for (const [env, expected] of [[{}, 0], [{ VERCEL: '1', VERCEL_ENV: 'preview' }, 0], [{ VERCEL: '1', VERCEL_ENV: 'production' }, 1]]) {
    let calls = 0;
    const integration = gamesSync({ env, synchronize: async () => { calls += 1; return { added: [], total: 1 }; } });
    await integration.hooks['astro:build:done']({ logger: logger() });
    assert.equal(calls, expected);
  }
});

test('a failed production sync blocks the build instead of silently shipping missing games', async () => {
  const integration = gamesSync({ env: { VERCEL: '1', VERCEL_ENV: 'production' }, synchronize: async () => { throw new Error('Storage offline'); } });
  await assert.rejects(integration.hooks['astro:build:done']({ logger: logger() }), /Storage offline/);
});

test('local startup and file saves sync automatically, with debounce and cleanup', async () => {
  const watcher = new EventEmitter();
  watcher.add = () => {};
  let calls = 0;
  const root = process.cwd();
  const integration = gamesSync({ root, env: {}, loadCredentials: async () => ({ token: 'fixture' }), synchronize: async () => { calls += 1; return { added: [], total: 1 }; } });
  await integration.hooks['astro:server:setup']({ server: { watcher }, logger: logger() });
  await delay(0);
  assert.equal(calls, 1);
  watcher.emit('change', path.join(root, 'README.md'));
  watcher.emit('change', path.join(root, 'games.json'));
  watcher.emit('add', path.join(root, 'games.json'));
  await delay(500);
  assert.equal(calls, 2);
  integration.hooks['astro:server:done']({});
  assert.equal(watcher.listenerCount('change'), 0);
  assert.equal(watcher.listenerCount('add'), 0);
});

test('local development remains available without storage credentials', async () => {
  const log = logger();
  const integration = gamesSync({ loadCredentials: async () => null, synchronize: () => assert.fail('Must not sync') });
  await integration.hooks['astro:server:setup']({ server: {}, logger: log });
  assert.match(log.errors[0], /Sin credenciales/);
});
