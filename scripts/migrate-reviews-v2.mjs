import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { gameBlobCredentials } from './lib/games-sync.mjs';
import { createGameBlobStore } from '../src/lib/game-blob-store.mjs';
import { validateGameLibrary } from '../src/lib/game-library.mjs';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const blob = args.has('--blob');
const local = args.has('--local') || !blob;
const server = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true } });
const backupRoot = path.join(root, '.codex-qa', 'review-v2-backups');

try {
  const { migrateGameReviews } = await server.ssrLoadModule('/src/lib/review-migration.ts');
  const { getGameValueMetrics } = await server.ssrLoadModule('/src/lib/game-finance.ts');
  async function migrate(source, raw, persist) {
    const before = validateGameLibrary(JSON.parse(raw.replace(/^\uFEFF/, '')), source);
    const after = migrateGameReviews(before);
    const changed = after.filter((game, index) => game !== before[index]);
    // Defensa adicional: ninguna migración puede alterar horas, precios, títulos o DLC.
    after.forEach((game, index) => {
      const omitReview = ({ critica, nota, ...rest }) => rest;
      if (JSON.stringify(omitReview(game)) !== JSON.stringify(omitReview(before[index]))) {
        throw new Error(`La migración intenta cambiar campos ajenos a la valoración (${source}).`);
      }
      if (getGameValueMetrics(game).scoreMultiplier !== getGameValueMetrics(before[index]).scoreMultiplier) {
        throw new Error(`La migración cambia el bonus de amortización (${source}).`);
      }
    });
    if (apply && changed.length) {
      await mkdir(backupRoot, { recursive: true });
      const checksum = createHash('sha256').update(raw).digest('hex');
      const backup = path.join(backupRoot, `${source}-${checksum}.json`);
      await writeFile(backup, raw, { encoding: 'utf8', flag: 'wx' }).catch((error) => { if (error.code !== 'EEXIST') throw error; });
      await persist(after, raw);
      console.log(`Copia de seguridad privada local: ${backup}`);
    }
    console.log(JSON.stringify({ source, applied: apply, total: before.length, migrated: changed.length,
      archivedScores: changed.filter((game) => game.critica.migracion.nota_anterior !== null).length,
      missingNewAreas: changed.length, unchangedOtherFields: true }));
  }
  if (local) {
    const filename = path.join(root, 'games.json');
    await migrate('local', await readFile(filename, 'utf8'), async (games, original) => {
      // No pisar una edición local ocurrida mientras se generaba el respaldo.
      if (await readFile(filename, 'utf8') !== original) throw new Error('games.json cambió durante la migración. Repite la comprobación.');
      await writeFile(filename, `${JSON.stringify(games, null, 2)}\n`, 'utf8');
    });
  }
  if (blob) {
    const credentials = await gameBlobCredentials(root);
    if (!credentials) throw new Error('Sin credenciales de Blob: no se ha modificado el almacén remoto.');
    const store = createGameBlobStore(credentials);
    const snapshot = await store.read();
    if (!snapshot) throw new Error('Blob no existe. No se crea ni se sustituye con la base local.');
    await migrate('blob', `${JSON.stringify(snapshot.games, null, 2)}\n`, async (games) => {
      await store.write(games, snapshot.etag);
      const verified = await store.read();
      if (!verified || verified.games.some((game) => migrateGameReviews([game])[0] !== game)) {
        throw new Error('No se pudo verificar la migración remota; vuelve a ejecutar la comprobación.');
      }
    });
  }
} finally {
  await server.close();
}
