export type CoverLookupGame = {
  titulo: string;
  launcher?: string | null;
  plataforma?: string | null;
  steam_appid?: number | null;
  cover_url?: string | null;
};

export function buildGameCoverUrl(game: CoverLookupGame) {
  const params = new URLSearchParams();

  params.set('title', game.titulo);

  if (game.launcher) params.set('launcher', game.launcher);
  if (game.plataforma) params.set('platform', game.plataforma);
  if (game.steam_appid != null) {
    params.set('steamAppId', String(game.steam_appid));
  }
  if (game.cover_url) params.set('coverUrl', game.cover_url);

  params.set('nocache', String(Date.now()));

  return `/api/cover?${params.toString()}`;
}

// Banner panorámico (Steam library_hero) para el fondo nítido del hero de
// la ficha. Solo tiene sentido con steam_appid — sin él ni se pide.
export function buildGameHeroUrl(game: CoverLookupGame) {
  const params = new URLSearchParams();

  params.set('title', game.titulo);
  params.set('variant', 'hero');
  if (game.steam_appid != null) {
    params.set('steamAppId', String(game.steam_appid));
  }

  params.set('nocache', String(Date.now()));

  return `/api/cover?${params.toString()}`;
}
