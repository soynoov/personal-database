export type SteamGameCredits = {
  developers: string[];
  publishers: string[];
};

const CACHE_TTL = 6 * 60 * 60 * 1000;
const FAILURE_TTL = 60 * 1000;
const cache = new Map<number, { expires: number; result: Promise<SteamGameCredits | null> }>();

export function isSteamAppId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 0xffffffff;
}

const names = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string').map(entry => entry.trim()).filter(Boolean))]
  : [];

/** Only public store credits; never write to the game library or return store HTML. */
export function parseSteamGameCredits(payload: unknown, appId: number): SteamGameCredits | null {
  if (!isSteamAppId(appId) || !payload || typeof payload !== 'object') return null;
  const entry = (payload as Record<string, unknown>)[String(appId)];
  if (!entry || typeof entry !== 'object' || !('success' in entry) || entry.success !== true || !('data' in entry)) return null;
  const data = entry.data;
  if (!data || typeof data !== 'object') return null;
  return {
    developers: names('developers' in data ? data.developers : null),
    publishers: names('publishers' in data ? data.publishers : null),
  };
}

export async function getSteamGameCredits(appId: number): Promise<SteamGameCredits | null> {
  if (!isSteamAppId(appId)) return null;
  const hit = cache.get(appId);
  if (hit && hit.expires > Date.now()) return hit.result;

  // Share in-flight requests and bound the cache in long-lived server processes.
  cache.delete(appId);
  if (cache.size >= 256) cache.delete(cache.keys().next().value!);
  const record = {
    expires: Date.now() + CACHE_TTL,
    result: (async () => {
      try {
        const response = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=es&l=spanish`,
          { signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } },
        );
        return response.ok ? parseSteamGameCredits(await response.json(), appId) : null;
      } catch {
        return null;
      }
    })(),
  };
  cache.set(appId, record);
  const result = await record.result;
  if (!result) record.expires = Date.now() + FAILURE_TTL;
  return result;
}
