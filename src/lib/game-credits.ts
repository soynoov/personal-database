import type { LocalGame } from './local-games';
import { getSteamGameCredits, isSteamAppId, type SteamGameCredits } from './steam-game-credits';

export type GameCreditMetadata = Pick<LocalGame, 'desarrolladoras' | 'editoras' | 'fuentes_datos' | 'steam_appid'>;

const names = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.filter((name): name is string => typeof name === 'string').map(name => name.trim()).filter(Boolean))]
  : [];

export function getSavedGameCredits(game: GameCreditMetadata): SteamGameCredits {
  return { developers: names(game.desarrolladoras), publishers: names(game.editoras) };
}

/** Stored original-release credits take precedence over a port's current Steam publisher. */
export async function getGameCredits(game: GameCreditMetadata): Promise<SteamGameCredits | null> {
  const saved = getSavedGameCredits(game);
  if ((saved.developers.length && saved.publishers.length) || !isSteamAppId(game.steam_appid)) return saved;
  const steam = await getSteamGameCredits(game.steam_appid);
  if (!steam) return saved.developers.length || saved.publishers.length ? saved : null;
  return {
    developers: saved.developers.length ? saved.developers : steam.developers,
    publishers: saved.publishers.length ? saved.publishers : steam.publishers,
  };
}

export function getGameCreditSource(game: GameCreditMetadata, field: keyof SteamGameCredits): string | null {
  if (getSavedGameCredits(game)[field].length) {
    for (const source of names(game.fuentes_datos)) {
      try {
        const url = new URL(source);
        if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
      } catch { /* Invalid source URLs are not rendered as links. */ }
    }
    return null;
  }
  return isSteamAppId(game.steam_appid) ? `https://store.steampowered.com/app/${game.steam_appid}/` : null;
}

/** Store navigation is separate from attribution of saved original-release credits. */
export function getGameCreditLinks(game: GameCreditMetadata): { href: string; label: string }[] {
  const steamUrl = isSteamAppId(game.steam_appid) ? `https://store.steampowered.com/app/${game.steam_appid}/` : null;
  const sources = [...new Set([
    getGameCreditSource(game, 'developers'),
    getGameCreditSource(game, 'publishers'),
  ])].filter((href): href is string => {
    if (!href) return false;
    const url = new URL(href);
    // Named store slugs and tracking parameters still refer to the same app.
    return !steamUrl || url.origin !== 'https://store.steampowered.com'
      || !new RegExp(`^/app/${game.steam_appid}(?:/|$)`).test(url.pathname);
  });
  return [
    ...(steamUrl ? [{ href: steamUrl, label: 'Ficha de Steam' }] : []),
    ...sources.map((href, index) => ({ href, label: sources.length > 1 ? `Fuente de datos ${index + 1}` : 'Fuente de datos' })),
  ];
}
