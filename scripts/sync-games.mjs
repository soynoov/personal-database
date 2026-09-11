import { formatGamesSync, syncGamesFile } from './lib/games-sync.mjs';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply')) {
  console.error('Uso: node scripts/sync-games.mjs [--apply]. Sin --apply solo comprueba las altas.');
  process.exitCode = 1;
} else {
  try {
    const result = await syncGamesFile(process.cwd(), { dryRun: !args.includes('--apply') });
    console.log(formatGamesSync(result));
  } catch (error) {
    console.error(`No se han sincronizado las altas: ${error.message}`);
    process.exitCode = 1;
  }
}
