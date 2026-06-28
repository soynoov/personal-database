import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const gamesPath = path.resolve(process.cwd(), "games.json");
const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 250;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sanitizeTitle(value) {
  return String(value ?? "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlockedSteamVariant(title, officialName) {
  const normalizedTitle = normalizeText(title);
  const normalizedOfficialName = normalizeText(officialName);

  const blockedVariants = ["demo", "playtest", "soundtrack", "test server", "server"];
  return blockedVariants.some((variant) =>
    normalizedOfficialName.includes(variant) && !normalizedTitle.includes(variant),
  );
}

function scoreCandidate(targetTitle, candidateTitle) {
  const target = normalizeText(targetTitle);
  const candidate = normalizeText(candidateTitle);

  if (!target || !candidate) return -1;
  if (target === candidate) return 100;

  if (candidate.startsWith(target)) {
    const ratio = target.length / candidate.length;
    return ratio >= 0.75 ? 85 : ratio >= 0.55 ? 60 : 35;
  }

  if (target.startsWith(candidate)) return 80;
  if (candidate.includes(target) || target.includes(candidate)) return 60;

  const targetTokens = new Set(target.split(" ").filter(Boolean));
  const candidateTokens = candidate.split(" ").filter(Boolean);
  const tokenHits = candidateTokens.filter((token) => targetTokens.has(token)).length;

  if (tokenHits === 0) return -1;
  return Math.min(60, tokenHits * 12);
}

async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "*/*",
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(input, init) {
  const response = await fetchWithTimeout(input, init);
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function pickStoreGenres(data) {
  const genres = Array.isArray(data?.genres)
    ? data.genres
        .map((genre) => (typeof genre?.description === "string" ? genre.description.trim() : ""))
        .filter(Boolean)
    : [];

  return genres.slice(0, 2);
}

async function fetchSteamDetails(appId) {
  const data = await fetchJson(
    `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=es&l=spanish`,
  );
  const entry = data?.[String(appId)];
  if (!entry?.success || !entry?.data) return null;
  return entry.data;
}

async function main() {
  const raw = await readFile(gamesPath, "utf8");
  const games = JSON.parse(raw.replace(/^\uFEFF/, ""));

  if (!Array.isArray(games)) {
    throw new Error("games.json no contiene un array");
  }

  let updated = 0;
  let unchanged = 0;
  let mismatched = 0;
  let unresolved = 0;

  for (let index = 0; index < games.length; index += 1) {
    const game = games[index];
    const appId = Number(game?.steam_appid);
    if (!Number.isInteger(appId) || appId <= 0) continue;

    const data = await fetchSteamDetails(appId);
    if (!data) {
      unresolved++;
      console.warn(`[unresolved] ${game?.titulo} -> Steam no devolvio appdetails para appid ${appId}`);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const officialName = typeof data.name === "string" ? data.name : null;
    const score = officialName ? scoreCandidate(sanitizeTitle(game?.titulo ?? ""), officialName) : -1;

    if (!officialName || score < 35 || isBlockedSteamVariant(game?.titulo ?? "", officialName)) {
      mismatched++;
      console.warn(
        `[mismatch] ${game?.titulo} -> appid ${appId} -> ${officialName ?? "sin nombre oficial"} (score ${score})`,
      );
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const nextStoreGenres = pickStoreGenres(data);
    const nextStoreName = officialName;
    const nextSyncedAt = new Date().toISOString();

    const sameGenres =
      JSON.stringify(Array.isArray(game.steam_store_genres) ? game.steam_store_genres : []) ===
      JSON.stringify(nextStoreGenres);
    const sameName = game.steam_store_name === nextStoreName;

    delete game.steam_library_capsule_url;

    if (sameGenres && sameName) {
      game.steam_last_sync_at = nextSyncedAt;
      unchanged++;
    } else {
      game.steam_store_genres = nextStoreGenres;
      game.steam_store_name = nextStoreName;
      game.steam_last_sync_at = nextSyncedAt;
      updated++;
      console.log(`[updated] ${game?.titulo} -> appid ${appId}`);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  if (updated > 0 || unchanged > 0) {
    await writeFile(gamesPath, `${JSON.stringify(games, null, 2)}\n`, "utf8");
  }

  console.log("");
  console.log(`updated=${updated}`);
  console.log(`unchanged=${unchanged}`);
  console.log(`mismatched=${mismatched}`);
  console.log(`unresolved=${unresolved}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
