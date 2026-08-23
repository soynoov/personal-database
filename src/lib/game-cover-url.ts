export type CoverLookupGame = {
  titulo: string;
  launcher?: string | null;
  plataforma?: string | null;
  steam_appid?: number | null;
  cover_url?: string | null;
};

function buildGameImageUrl(game: CoverLookupGame, variant: 'poster' | 'hero') {
  const params = new URLSearchParams();

  params.set('title', game.titulo);
  params.set('variant', variant);

  if (game.launcher) params.set('launcher', game.launcher);
  if (game.plataforma) params.set('platform', game.plataforma);
  if (game.steam_appid != null) {
    params.set('steamAppId', String(game.steam_appid));
  }
  if (game.cover_url) params.set('coverUrl', game.cover_url);

  params.set('nocache', String(Date.now()));

  return `/api/cover?${params.toString()}`;
}

export function buildGameCoverUrl(game: CoverLookupGame) {
  return buildGameImageUrl(game, 'poster');
}

export function buildGameHeroUrl(game: CoverLookupGame) {
  return buildGameImageUrl(game, 'hero');
}
