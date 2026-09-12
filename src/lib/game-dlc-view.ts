import type { LocalGame } from './local-games';
import { isAcquiredDlc } from './game-finance';
import { getPriceBalance, parsePrice } from './price-balance';

export type DlcItem = NonNullable<NonNullable<LocalGame['dlcs']>['items']>[number];

export function getDlcCardView(dlc: DlcItem, gameTitle = '') {
  const fullTitle = dlc.titulo?.trim() || 'DLC sin nombre';
  const prefix = gameTitle.trim();
  const suffix = prefix && fullTitle.toLocaleLowerCase('es').startsWith(prefix.toLocaleLowerCase('es')) ? fullTitle.slice(prefix.length) : '';
  const title = /^\s*[:–—-]\s*\S/.test(suffix) ? suffix.replace(/^\s*[:–—-]\s*/, '') : fullTitle;
  const owned = isAcquiredDlc(dlc);
  const paid = parsePrice(dlc.precio_pagado);
  const current = parsePrice(dlc.precio_actual);
  const date = dlc.fecha_adquisicion ? new Date(`${dlc.fecha_adquisicion}T00:00:00Z`) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : 'Fecha sin registrar';
  return { title, fullTitle, owned, paid, current, dateLabel, balance: getPriceBalance(owned ? paid : null, owned ? current : null) };
}
