import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const rootGamesPath = path.resolve(process.cwd(), "..", "games.json");
const localGamesPath = path.resolve(process.cwd(), "games.json");

if (existsSync(rootGamesPath)) {
  copyFileSync(rootGamesPath, localGamesPath);
  console.log(`Synced ${rootGamesPath} -> ${localGamesPath}`);
} else {
  console.log(`Using committed ${localGamesPath}`);
}
