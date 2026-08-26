import type { LocalGame } from './local-games';
import { slugifyGameTitle } from './local-games';
import { getGameGenres } from './game-genres';

export type RouletteGame = Pick<
  LocalGame,
  | 'titulo'
  | 'estado'
  | 'launcher'
  | 'plataforma'
  | 'horas'
  | 'hltb'
  | 'generos'
  | 'tags'
  | 'modos'
  | 'solo'
  | 'steam_appid'
  | 'cover_url'
> & {
  slug: string;
};

export function toRouletteGame(game: LocalGame): RouletteGame {
  return {
    slug: slugifyGameTitle(game.titulo),
    titulo: game.titulo,
    estado: game.estado,
    launcher: game.launcher,
    plataforma: game.plataforma,
    horas: game.horas,
    hltb: game.hltb,
    generos: getGameGenres(game.generos),
    tags: game.tags,
    modos: game.modos,
    solo: game.solo,
    steam_appid: game.steam_appid,
    cover_url: game.cover_url,
  };
}
