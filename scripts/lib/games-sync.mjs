import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { createGameBlobStore, hasGameBlobCredentials } from '../../src/lib/game-blob-store.mjs';
import { syncGameAdditions } from '../../src/lib/game-library.mjs';

/** Load only storage credentials, never VERCEL/CI flags from a downloaded .env.local. */
export async function gameBlobCredentials(root, env = process.env) {
  let fileEnv = {};
  for (const name of ['.env', '.env.local']) {
    try {
      fileEnv = { ...fileEnv, ...parseEnv(await readFile(path.join(root, name), 'utf8')) };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const credentials = {
    BLOB_READ_WRITE_TOKEN: env.BLOB_READ_WRITE_TOKEN || fileEnv.BLOB_READ_WRITE_TOKEN,
    BLOB_STORE_ID: env.BLOB_STORE_ID || fileEnv.BLOB_STORE_ID,
    VERCEL_OIDC_TOKEN: env.VERCEL_OIDC_TOKEN || fileEnv.VERCEL_OIDC_TOKEN,
  };
  if (!hasGameBlobCredentials(credentials)) return null;
  return credentials.BLOB_READ_WRITE_TOKEN
    ? { token: credentials.BLOB_READ_WRITE_TOKEN }
    : { storeId: credentials.BLOB_STORE_ID, oidcToken: credentials.VERCEL_OIDC_TOKEN };
}

export async function syncGamesFile(root, { dryRun = false, credentials } = {}) {
  const auth = credentials ?? await gameBlobCredentials(root);
  if (!auth) throw new Error('Faltan las credenciales de Vercel Blob; games.json sigue guardado en local.');
  const raw = await readFile(path.join(root, 'games.json'), 'utf8');
  return syncGameAdditions(JSON.parse(raw.replace(/^\uFEFF/, '')), createGameBlobStore(auth), { dryRun });
}

export function formatGamesSync(result) {
  const action = result.dryRun ? 'Altas pendientes' : 'Altas sincronizadas';
  return `${action}: ${result.added.length}. Total en Blob: ${result.total}.` +
    (result.added.length ? ` Juegos: ${result.added.join(', ')}.` : ' Sin cambios.');
}
