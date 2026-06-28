import type { CoverLookupGame } from "./game-cover-url";

type CoverResult = {
  url: string | null;
  source: string;
};

type CacheEntry = {
  expiresAt: number;
  result: CoverResult;
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;
const cache = new Map<string, CacheEntry>();

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLauncher(value: unknown) {
  return normalizeText(value);
}

function sanitizeTitleForSearch(title: string) {
  return title
    .replace(/\bmobile\b/gi, "")
    .replace(/\benhanced\b/gi, "")
    .replace(/\blegacy\b/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCacheKey(game: CoverLookupGame) {
  return JSON.stringify({
    title: game.titulo,
    launcher: game.launcher ?? null,
    platform: game.plataforma ?? null,
    steamAppId: game.steam_appid ?? null,
    legacyCoverUrl: game.cover_url ?? null,
  });
}

async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        accept: "*/*",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetchWithTimeout(input, init);
  if (!response.ok) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchText(input: string, init?: RequestInit) {
  const response = await fetchWithTimeout(input, init);
  if (!response.ok) return null;
  return response.text();
}

function scoreCandidate(targetTitle: string, candidateTitle: string) {
  const target = normalizeText(targetTitle);
  const candidate = normalizeText(candidateTitle);

  if (!target || !candidate) return -1;
  if (target === candidate) return 100;
  if (candidate.startsWith(target)) return 85;
  if (target.startsWith(candidate)) return 80;
  if (candidate.includes(target) || target.includes(candidate)) return 65;

  const targetTokens = new Set(target.split(" ").filter(Boolean));
  const candidateTokens = candidate.split(" ").filter(Boolean);
  const tokenHits = candidateTokens.filter((token) => targetTokens.has(token)).length;

  if (tokenHits === 0) return -1;
  return Math.min(60, tokenHits * 12);
}

function cleanupUrl(url: string) {
  return url
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .trim();
}

async function resolveSteamByAppId(game: CoverLookupGame): Promise<CoverResult | null> {
  if (game.steam_appid == null) return null;

  return {
    url: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.steam_appid}/header.jpg`,
    source: "Steam CDN",
  };
}

async function resolveSteamBySearch(game: CoverLookupGame): Promise<CoverResult | null> {
  const title = sanitizeTitleForSearch(game.titulo);
  if (!title) return null;

  const data = await fetchJson<{
    items?: Array<{
      id?: number;
      name?: string;
      tiny_image?: string;
    }>;
  }>(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&cc=es&l=spanish`);

  const bestMatch = (data?.items ?? [])
    .map((item) => ({
      item,
      score: scoreCandidate(title, item.name ?? ""),
    }))
    .filter((entry) => entry.item.id != null && entry.score >= 65)
    .sort((a, b) => b.score - a.score)[0];

  if (!bestMatch?.item.id) return null;

  return {
    url: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${bestMatch.item.id}/header.jpg`,
    source: "Steam search",
  };
}

function pickHltbImageFromPayload(payload: unknown, title: string): string | null {
  const candidates: Array<{ title: string; image: string; score: number }> = [];

  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const entry = value as Record<string, unknown>;
    const candidateTitle =
      typeof entry.game_name === "string"
        ? entry.game_name
        : typeof entry.title === "string"
          ? entry.title
          : typeof entry.name === "string"
            ? entry.name
            : null;
    const imageValue =
      typeof entry.game_image === "string"
        ? entry.game_image
        : typeof entry.image_url === "string"
          ? entry.image_url
          : typeof entry.image === "string"
            ? entry.image
            : null;

    if (candidateTitle && imageValue) {
      const score = scoreCandidate(title, candidateTitle);
      if (score >= 60) {
        const normalizedUrl = imageValue.startsWith("http")
          ? imageValue
          : `https://howlongtobeat.com${imageValue.startsWith("/") ? "" : "/"}${imageValue}`;
        candidates.push({
          title: candidateTitle,
          image: normalizedUrl,
          score,
        });
      }
    }

    Object.values(entry).forEach(visit);
  };

  visit(payload);

  return candidates.sort((a, b) => b.score - a.score)[0]?.image ?? null;
}

async function resolveHltbCover(game: CoverLookupGame): Promise<CoverResult | null> {
  const title = sanitizeTitleForSearch(game.titulo);
  if (!title) return null;

  const payload = {
    searchType: "games",
    searchTerms: [title],
    searchPage: 1,
    size: 20,
    searchOptions: {
      games: {
        userId: 0,
        platform: "",
        sortCategory: "popular",
        rangeCategory: "main",
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: "", flow: "", genre: "", difficulty: "" },
        rangeYear: { min: "", max: "" },
        modifier: "",
      },
      users: { sortCategory: "postcount" },
      filter: "",
      sort: 0,
      randomizer: 0,
    },
    useCache: true,
  };

  const data = await fetchJson<unknown>("https://howlongtobeat.com/api/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://howlongtobeat.com",
      referer: "https://howlongtobeat.com/",
    },
    body: JSON.stringify(payload),
  });

  const imageUrl = data ? pickHltbImageFromPayload(data, title) : null;
  if (!imageUrl) return null;

  return {
    url: cleanupUrl(imageUrl),
    source: "HLTB",
  };
}

function extractFirstImage(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = match?.[1] ?? match?.[0];
    if (candidate) return cleanupUrl(candidate);
  }

  return null;
}

async function resolveEpicCover(game: CoverLookupGame): Promise<CoverResult | null> {
  if (normalizeLauncher(game.launcher) !== "epic games") return null;

  const title = sanitizeTitleForSearch(game.titulo);
  if (!title) return null;

  const html = await fetchText(
    `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(title)}&sortBy=relevancy&sortDir=DESC&count=40`,
    {
      headers: {
        accept: "text/html,application/xhtml+xml",
      },
    },
  );
  if (!html) return null;

  const imageUrl = extractFirstImage(html, [
    /https?:\/\/cdn1\.epicgames\.com\/[^"'\\\s>]+/i,
    /"url":"(https?:\\\/\\\/cdn1\.epicgames\.com\\\/[^"]+)"/i,
  ]);
  if (!imageUrl) return null;

  return {
    url: imageUrl,
    source: "Epic Games Store",
  };
}

async function resolveXboxCover(game: CoverLookupGame): Promise<CoverResult | null> {
  const launcher = normalizeLauncher(game.launcher);
  if (launcher !== "gamepass" && launcher !== "xbox game pass") return null;

  const title = sanitizeTitleForSearch(game.titulo);
  if (!title) return null;

  const html = await fetchText(`https://www.xbox.com/es-ES/games/search?q=${encodeURIComponent(title)}`, {
    headers: {
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!html) return null;

  const imageUrl = extractFirstImage(html, [
    /https?:\/\/store-images\.s-microsoft\.com\/image\/[^"'\\\s>]+/i,
    /"image":"(https?:\\\/\\\/store-images\.s-microsoft\.com\\\/image\\\/[^"]+)"/i,
  ]);
  if (!imageUrl) return null;

  return {
    url: imageUrl,
    source: "Xbox catalog",
  };
}

async function resolveLegacyCover(game: CoverLookupGame): Promise<CoverResult | null> {
  if (!game.cover_url) return null;

  return {
    url: game.cover_url,
    source: "Legacy games.json",
  };
}

export async function resolveGameCover(game: CoverLookupGame): Promise<CoverResult> {
  const cacheKey = buildCacheKey(game);
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) return cached.result;

  const providers = [
    resolveSteamByAppId,
    resolveSteamBySearch,
    resolveHltbCover,
    resolveEpicCover,
    resolveXboxCover,
    resolveLegacyCover,
  ];

  for (const provider of providers) {
    try {
      const result = await provider(game);
      if (!result?.url) continue;

      cache.set(cacheKey, {
        expiresAt: now + SIX_HOURS_MS,
        result,
      });
      return result;
    } catch {
      continue;
    }
  }

  const fallback = {
    url: null,
    source: "Fallback",
  };
  cache.set(cacheKey, {
    expiresAt: now + SIX_HOURS_MS,
    result: fallback,
  });
  return fallback;
}

function getInitials(title: string) {
  const parts = title
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "??";
  return parts.map((part) => part[0]).join("").toUpperCase();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildCoverFallbackSvg(title: string) {
  const safeTitle = escapeXml(title);
  const initials = escapeXml(getInitials(title));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title>
  <desc id="desc">Portada temporal generada automaticamente para ${safeTitle}</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#13202f" />
      <stop offset="100%" stop-color="#0a0f16" />
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)" rx="28" />
  <circle cx="505" cy="82" r="92" fill="rgba(89, 190, 255, 0.16)" />
  <circle cx="132" cy="298" r="118" fill="rgba(255, 113, 77, 0.14)" />
  <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#f6f1eb" font-family="Georgia, serif" font-size="108" font-weight="700">${initials}</text>
  <text x="50%" y="76%" dominant-baseline="middle" text-anchor="middle" fill="#b9c7d7" font-family="Verdana, sans-serif" font-size="28">${safeTitle}</text>
</svg>`;
}
