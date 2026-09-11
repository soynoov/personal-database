import { BlobPreconditionFailedError, get, put } from '@vercel/blob';
import { GamesVersionConflictError, validateGameLibrary } from './game-library.mjs';

export const GAMES_BLOB_PATH = 'personal-database/games.json';

export function hasGameBlobCredentials(env = process.env) {
  return Boolean(env.BLOB_READ_WRITE_TOKEN || (env.BLOB_STORE_ID && env.VERCEL_OIDC_TOKEN));
}

/** Server-only adapter shared by the editor and the automatic add-only importer. */
export function createGameBlobStore(credentials = {}, sdk = { get, put }) {
  const read = async () => {
    const result = await sdk.get(GAMES_BLOB_PATH, { ...credentials, access: 'private', useCache: false });
    if (!result) return null;
    if (result.statusCode !== 200 || !result.stream || !result.blob.etag) {
      throw new Error('Vercel Blob no devolvió el contenido y la versión de la biblioteca.');
    }
    const raw = await new Response(result.stream).text();
    const games = validateGameLibrary(JSON.parse(raw.replace(/^\uFEFF/, '')), 'Vercel Blob');
    // Compressed responses may expose a weak ETag; Blob's ifMatch needs the strong value.
    return { games, etag: result.blob.etag.replace(/^W\//, '') };
  };

  const write = async (games, etag) => {
    validateGameLibrary(games);
    if (etag !== null && (typeof etag !== 'string' || !etag)) {
      throw new Error('Hay que leer la versión de la biblioteca antes de guardarla.');
    }
    try {
      const saved = await sdk.put(GAMES_BLOB_PATH, `${JSON.stringify(games, null, 2)}\n`, {
        ...credentials,
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: etag !== null,
        ...(etag !== null ? { ifMatch: etag } : {}),
        cacheControlMaxAge: 60,
        contentType: 'application/json; charset=utf-8',
      });
      return saved.etag;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) throw new GamesVersionConflictError();
      // Another writer may have created the initially missing Blob. Do not overwrite it.
      if (etag === null && await read().catch(() => null)) throw new GamesVersionConflictError();
      throw error;
    }
  };

  return { read, write };
}
