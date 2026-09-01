/**
 * cover-resolver.ts
 *
 * Exporta resolveGameCover y buildCoverFallbackSvg para la API route cover.ts.
 *
 * Resuelve las library_capsule URLs bajo demanda y mantiene un cache en memoria
 * durante la vida de la instancia del servidor.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type CoverLookupGame = {
  titulo: string;
  launcher?: string | null;
  plataforma?: string | null;
  steam_appid?: number | null;
};

export type CoverResult = {
  url: string | null;
  source: string;
};

export type CoverVariant = 'poster' | 'hero';

// ─── SVG fallback ─────────────────────────────────────────────────────────────

function escapeXml(v: string): string {
  return v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getInitials(title: string): string {
  const parts = title.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? '').join('').toUpperCase() || '??';
}

export function buildCoverFallbackSvg(title: string): string {
  const safe = escapeXml(title);
  const initials = escapeXml(getInitials(title));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">',
    '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    '<stop offset="0%" stop-color="#13202f"/>',
    '<stop offset="100%" stop-color="#0a0f16"/>',
    '</linearGradient></defs>',
    '<rect width="640" height="360" fill="url(#bg)" rx="28"/>',
    '<circle cx="505" cy="82" r="92" fill="rgba(89,190,255,0.16)"/>',
    '<circle cx="132" cy="298" r="118" fill="rgba(255,113,77,0.14)"/>',
    `<text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#f6f1eb" font-family="Georgia,serif" font-size="108" font-weight="700">${initials}</text>`,
    `<text x="50%" y="76%" dominant-baseline="middle" text-anchor="middle" fill="#b9c7d7" font-family="Verdana,sans-serif" font-size="28">${safe}</text>`,
    '</svg>',
  ].join('');
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const CDN_BASE = 'https://shared.akamai.steamstatic.com/store_item_assets/';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const PER_REQUEST_TIMEOUT_MS = 7000;

type CacheEntry = {
  capsuleUrl: string | null;
  heroUrl: string | null;
  expiresAt: number;
};
const coverCache = new Map<number, CacheEntry>();

function buildUrl(fmt: string, filename: string): string {
  // ${FILENAME} primero: si fuera al revés, replace('{FILENAME}') consume el {FILENAME}
  // de ${FILENAME} y deja el $ suelto en la URL resultante.
  return CDN_BASE + fmt.replace('${FILENAME}', filename).replace('{FILENAME}', filename);
}

function buildEntryFromAssets(assets: StoreAssets | undefined): Omit<CacheEntry, 'expiresAt'> {
  const fmt = assets?.asset_url_format;
  const lc = assets?.library_capsule;
  const hero = assets?.library_hero;
  return {
    capsuleUrl: fmt && lc ? buildUrl(fmt, lc) : null,
    heroUrl: fmt && hero ? buildUrl(fmt, hero) : null,
  };
}

// ─── Steam IStoreBrowseService/GetItems/v1 ────────────────────────────────────

type StoreAssets = Record<string, string>;
type StoreItem = { appid?: number; assets?: StoreAssets };

async function fetchIStoreBrowse(
  appIds: number[],
  timeoutMs: number,
): Promise<StoreItem[]> {
  if (appIds.length === 0) return [];

  const inputJson = JSON.stringify({
    ids: appIds.map((appid) => ({ appid })),
    context: { country_code: 'US', language: 'english', steam_realm: 1 },
    data_request: { include_assets: true },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(inputJson)}`,
      {
        signal: controller.signal,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          accept: 'application/json',
        },
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data?.response?.store_items ?? []) as StoreItem[];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Per-request resolver (fallback si el appId no está en cache) ─────────────

async function fetchSteamAssetsCached(appId: number): Promise<CacheEntry> {
  const now = Date.now();
  const cached = coverCache.get(appId);
  if (cached && cached.expiresAt > now) return cached;

  const items = await fetchIStoreBrowse([appId], PER_REQUEST_TIMEOUT_MS);
  const entry: CacheEntry = {
    ...buildEntryFromAssets(items[0]?.assets),
    expiresAt: now + TWENTY_FOUR_HOURS_MS,
  };
  coverCache.set(appId, entry);
  return entry;
}

async function fetchSteamLibraryCapsule(appId: number): Promise<string | null> {
  return (await fetchSteamAssetsCached(appId)).capsuleUrl;
}

async function fetchSteamLibraryHero(appId: number): Promise<string | null> {
  return (await fetchSteamAssetsCached(appId)).heroUrl;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function resolveGameCover(
  game: CoverLookupGame,
  variant: CoverVariant = 'poster',
): Promise<CoverResult> {
  if (!game.steam_appid) {
    return { url: null, source: 'No steam_appid' };
  }

  if (variant === 'hero') {
    const heroUrl = await fetchSteamLibraryHero(game.steam_appid);
    if (heroUrl) {
      return { url: heroUrl, source: 'Steam library hero' };
    }

    return {
      url: `${CDN_BASE}steam/apps/${game.steam_appid}/header.jpg`,
      source: 'Steam header',
    };
  }

  const capsuleUrl = await fetchSteamLibraryCapsule(game.steam_appid);
  if (capsuleUrl) {
    return { url: capsuleUrl, source: 'Steam library capsule' };
  }

  // Fallback para DLCs: library_capsule siempre es null en IStoreBrowseService para DLCs.
  // Intentamos header.jpg sin hash (funciona en CDN para apps antiguas y muchos DLCs).
  // Si la URL falla (DLCs nuevos con hash en el path), cover.ts cae al coverUrlParam.
  const headerUrl = `${CDN_BASE}steam/apps/${game.steam_appid}/header.jpg`;
  return { url: headerUrl, source: 'Steam header' };
}
