/**
 * cover-resolver.ts
 *
 * Exporta resolveGameCover y buildCoverFallbackSvg para la API route cover.ts.
 *
 * Al arrancar el servidor lee games.json, obtiene todas las library_capsule URLs
 * de Steam en batches y puebla un cache en memoria. Se refresca cada 24 horas.
 *
 * Per-request: si el appId no está en cache (juego nuevo añadido sin reiniciar),
 * hace la llamada individual y lo cachea.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Detección de ejecución directa (debe ir al principio) ───────────────────

const isDirectRun = (() => {
  try {
    const metaUrl = (import.meta as { url?: string }).url;
    if (!metaUrl || !process.argv[1]) return false;
    const thisPath = fileURLToPath(metaUrl).replace(/\\/g, '/');
    const argv1 = process.argv[1].replace(/\\/g, '/');
    return thisPath === argv1;
  } catch {
    return false;
  }
})();

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
const WARMUP_TIMEOUT_MS = 30_000;
const WARMUP_BATCH_SIZE = 50; // appIds por llamada (URL length safety)
const WARMUP_BATCH_DELAY_MS = 300; // pausa entre batches para no saturar Steam

type CacheEntry = {
  capsuleUrl: string | null;
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
  return {
    capsuleUrl: fmt && lc ? buildUrl(fmt, lc) : null,
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

// ─── Warmup: batch al inicio + cada 24h ──────────────────────────────────────

function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
  return result;
}

async function readSteamAppIds(): Promise<number[]> {
  const candidates = [
    path.resolve(process.cwd(), 'games.json'),
    path.resolve(process.cwd(), '..', 'games.json'),
  ];
  const gamesPath = candidates.find(existsSync);
  if (!gamesPath) return [];

  try {
    const raw = await fs.readFile(gamesPath, 'utf8');
    const games = JSON.parse(raw.replace(/^﻿/, '')) as Array<Record<string, unknown>>;
    return games
      .map((g) => g.steam_appid)
      .filter((id): id is number => typeof id === 'number' && id > 0);
  } catch {
    return [];
  }
}

async function runWarmup(): Promise<void> {
  const appIds = await readSteamAppIds();
  if (appIds.length === 0) return;

  console.log(`[cover] warmup: ${appIds.length} juegos con Steam ID…`);
  const now = Date.now();
  let cached = 0;

  for (const batch of chunk(appIds, WARMUP_BATCH_SIZE)) {
    const items = await fetchIStoreBrowse(batch, WARMUP_TIMEOUT_MS);

    for (const item of items) {
      if (!item.appid) continue;
      const entry: CacheEntry = { ...buildEntryFromAssets(item.assets), expiresAt: now + TWENTY_FOUR_HOURS_MS };
      coverCache.set(item.appid, entry);
      if (entry.capsuleUrl) cached++;
    }

    // Pausa entre batches para no saturar Steam
    if (batch !== chunk(appIds, WARMUP_BATCH_SIZE).at(-1)) {
      await new Promise((r) => setTimeout(r, WARMUP_BATCH_DELAY_MS));
    }
  }

  console.log(`[cover] warmup completo: ${cached}/${appIds.length} portadas cacheadas`);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function resolveGameCover(game: CoverLookupGame): Promise<CoverResult> {
  if (!game.steam_appid) {
    return { url: null, source: 'No steam_appid' };
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

// ─── Scheduler (solo en modo servidor, no en script directo) ─────────────────

if (!isDirectRun) {
  // Warmup inmediato al arrancar (no bloquea el servidor)
  runWarmup().catch((err: unknown) => console.warn('[cover] warmup error:', err));

  // Refresh cada 24h
  setInterval(
    () => runWarmup().catch((err: unknown) => console.warn('[cover] warmup error:', err)),
    TWENTY_FOUR_HOURS_MS,
  ).unref(); // .unref() evita que el interval impida cerrar el proceso
}
