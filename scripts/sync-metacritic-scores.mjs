import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATA_PATH = resolve(process.cwd(), "games.json");
const SHOULD_WRITE = process.argv.includes("--write");
const SUMMARY_ONLY = process.argv.includes("--summary");
const CONCURRENCY = 4;

const slugAliases = new Map([
  ["oddsparks", "oddsparks-an-automation-adventure"],
  ["r-e-p-o", "repo"],
  ["grand-theft-auto-v-legacy", "grand-theft-auto-v"],
  ["metro-last-light-complete-edition", "metro-last-light"],
  ["metro-2033", "metro-2033-redux"],
  ["the-elder-scrolls-v-skyrim", "the-elder-scrolls-v-skyrim-special-edition"],
  ["hitman", "hitman"],
]);

const acceptedTitleAliases = new Map([
  ["banana", "banana-aaladin66"],
  ["mini-airways", "mini-airways-atc-simulator"],
  ["oddsparks", "oddsparks-an-automation-adventure"],
  ["paladins", "paladins-champions-of-the-realm"],
]);

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtml(value) {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&colon;", ":")
    .replaceAll("&#39;", "'");
}

function normalizeTitle(value) {
  return slugify(decodeHtml(value))
    .replace(/-(directors-cut|complete-edition|definitive-edition|enhanced|legacy|classic|evolved|reatomized)$/u, "")
    .replace(/^marvels?-/, "");
}

function titlesMatch(expected, actual) {
  const left = normalizeTitle(expected);
  const right = normalizeTitle(actual);
  if (left === right || acceptedTitleAliases.get(left) === right) return true;

  const leftTokens = new Set(left.split("-").filter(Boolean));
  const rightTokens = new Set(right.split("-").filter(Boolean));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union > 0 && intersection / union >= 0.65;
}

function extractPageTitle(html) {
  const match = html.match(/<title>([^<]+?) Reviews - Metacritic<\/title>/i);
  return match ? decodeHtml(match[1].trim()) : null;
}

function extractScore(html, label) {
  const header = `data-testid="global-score-header">${label}</div>`;
  const start = html.indexOf(header);
  if (start < 0) return null;

  const nextScoreBlock = html.indexOf('data-testid="product-score"', start + header.length);
  const block = html.slice(start, nextScoreBlock > start ? nextScoreBlock : start + 3000);
  const raw = block.match(/data-testid="global-score-value">([^<]+)</i)?.[1]?.trim();
  if (!raw || raw.toLowerCase() === "tbd") return null;
  const score = Number(raw);
  return Number.isFinite(score) ? score : null;
}

async function fetchScores(game) {
  const generatedSlug = slugify(game.titulo);
  const slug = slugAliases.get(generatedSlug) ?? generatedSlug;
  const url = `https://www.metacritic.com/game/${slug}/`;
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    return { status: "unresolved", title: game.titulo, url, reason: `HTTP ${response.status}` };
  }

  const html = await response.text();
  const pageTitle = extractPageTitle(html);
  if (!pageTitle || !titlesMatch(game.titulo, pageTitle)) {
    return {
      status: "unresolved",
      title: game.titulo,
      url: response.url,
      reason: pageTitle ? `title mismatch: ${pageTitle}` : "missing product title",
    };
  }

  const metascore = extractScore(html, "Metascore");
  const userscore = extractScore(html, "User score");
  if (metascore === null && userscore === null) {
    return { status: "unscored", title: game.titulo, pageTitle, url: response.url };
  }

  return { status: "matched", title: game.titulo, pageTitle, url: response.url, metascore, userscore };
}

async function mapConcurrent(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await worker(items[index]);
      } catch (error) {
        results[index] = {
          status: "unresolved",
          title: items[index].titulo,
          reason: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

const games = JSON.parse(await readFile(DATA_PATH, "utf8"));
const incompleteGames = games.filter(
  (game) => game.critica?.metascore == null || game.critica?.userscore == null,
);
const results = await mapConcurrent(incompleteGames, fetchScores, CONCURRENCY);
const byTitle = new Map(results.map((result) => [result.title, result]));

let updated = 0;
for (const game of games) {
  const result = byTitle.get(game.titulo);
  if (!result || result.status !== "matched") continue;

  game.critica ??= {};
  if (game.critica.metascore == null && result.metascore !== null) game.critica.metascore = result.metascore;
  if (game.critica.userscore == null && result.userscore !== null) game.critica.userscore = result.userscore;
  updated += 1;
}

if (SHOULD_WRITE) {
  await writeFile(DATA_PATH, `${JSON.stringify(games, null, 2)}\n`, "utf8");
}

const summary = {
  mode: SHOULD_WRITE ? "write" : "dry-run",
  totalGames: games.length,
  incompleteBefore: incompleteGames.length,
  updated,
  matched: results.filter((result) => result.status === "matched"),
  unscored: results.filter((result) => result.status === "unscored"),
  unresolved: results.filter((result) => result.status === "unresolved"),
};

console.log(JSON.stringify(
  SUMMARY_ONLY
    ? {
        mode: summary.mode,
        totalGames: summary.totalGames,
        incompleteBefore: summary.incompleteBefore,
        updated: summary.updated,
        matched: summary.matched.length,
        unscored: summary.unscored.map(({ title }) => title),
        unresolved: summary.unresolved.map(({ title, reason }) => ({ title, reason })),
        invalidMetascores: summary.matched
          .filter(({ metascore }) => metascore !== null && (!Number.isInteger(metascore) || metascore < 0 || metascore > 100))
          .map(({ title, metascore }) => ({ title, metascore })),
        invalidUserscores: summary.matched
          .filter(({ userscore }) => userscore !== null && (userscore < 0 || userscore > 10))
          .map(({ title, userscore }) => ({ title, userscore })),
      }
    : summary,
  null,
  2,
));
