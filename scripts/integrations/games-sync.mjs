import path from 'node:path';
import { gameBlobCredentials, formatGamesSync, syncGamesFile } from '../lib/games-sync.mjs';

/** Import only additions, both on local saves and after a successful production build. */
export default function gamesSync({
  root = process.cwd(),
  env = process.env,
  loadCredentials = gameBlobCredentials,
  synchronize = syncGamesFile,
} = {}) {
  const productionBuild = env.VERCEL === '1' && env.VERCEL_ENV === 'production';
  let dispose = () => {};

  return {
    name: 'noovdb-games-sync',
    hooks: {
      'astro:server:setup': async ({ server, logger }) => {
        const credentials = await loadCredentials(root);
        if (!credentials) {
          logger.warn('Sin credenciales de Blob: las altas se guardan solo en games.json.');
          return;
        }
        let timer;
        let pending = false;
        let running = false;
        let closed = false;
        const run = async () => {
          pending = true;
          if (running || closed) return;
          running = true;
          try {
            while (pending && !closed) {
              pending = false;
              try {
                logger.info(formatGamesSync(await synchronize(root, { credentials })));
              } catch (error) {
                logger.error(`No se han sincronizado las altas: ${error.message}. Reintenta con npm run sync:games.`);
              }
            }
          } finally {
            running = false;
          }
        };
        const gamesPath = path.join(root, 'games.json');
        const onFile = (file) => {
          if (path.resolve(file) !== gamesPath || closed) return;
          clearTimeout(timer);
          timer = setTimeout(() => { void run(); }, 400);
        };
        server.watcher.add(gamesPath);
        server.watcher.on('change', onFile);
        server.watcher.on('add', onFile);
        dispose = () => {
          closed = true;
          clearTimeout(timer);
          server.watcher.off('change', onFile);
          server.watcher.off('add', onFile);
        };
        // Do not delay the local server if the storage service is unavailable.
        void run();
      },
      'astro:server:done': () => dispose(),
      'astro:build:done': async ({ logger }) => {
        // Preview and ordinary local builds must never mutate the production library.
        if (!productionBuild) return;
        logger.info(formatGamesSync(await synchronize(root)));
      },
    },
  };
}
