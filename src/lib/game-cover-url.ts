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
