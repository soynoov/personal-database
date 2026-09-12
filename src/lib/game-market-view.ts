import type { LocalGame } from './local-games';
import { getPaidUnitPrice } from './local-games';
import { getPurchasePriceComparison, isAcquiredDlc } from './game-finance';
import { hasGameTag } from './game-tags';
import { getPriceBalance, parsePrice as price } from './price-balance';

const sum = (values: number[]) => Number(values.reduce((total, value) => total + value, 0).toFixed(2));
export type PriceReference = { kind: 'launch' | 'purchase' | 'current'; label: string; value: number };

/** Paired observations only: missing prices never silently become zero. */
export function getDlcPriceComparison(items: NonNullable<LocalGame['dlcs']>['items'] = []) {
  const acquired = (items ?? []).filter(isAcquiredDlc);
  const rows = acquired.flatMap((dlc) => {
    const paid = price(dlc.precio_pagado);
    const current = price(dlc.precio_actual);
    return paid === null || current === null ? [] : [{ title: dlc.titulo, paid, current, balance: getPriceBalance(paid, current) }];
  });
  const paidTotal = rows.length ? sum(rows.map(row => row.paid)) : null;
  const currentTotal = rows.length ? sum(rows.map(row => row.current)) : null;
  const pending = (items ?? []).filter(dlc => !isAcquiredDlc(dlc));
  const pendingPrices = pending.map(dlc => price(dlc.precio_actual)).filter((value): value is number => value !== null);
  const balance = getPriceBalance(paidTotal, currentTotal);
  return {
    rows, acquiredCount: acquired.length, excludedCount: acquired.length - rows.length,
    paidTotal, currentTotal,
    balance, difference: balance.difference,
    pendingCount: pending.length, pendingKnownCount: pendingPrices.length,
    pendingTotal: pendingPrices.length ? sum(pendingPrices) : null,
  };
}

export function getGameMarketView(game: LocalGame) {
  const paid = price(getPaidUnitPrice(game));
  const launch = price(game.precio_salida);
  const current = price(game.precio_actual);
  const historicLow = price(game.precio_minimo_historico);
  const points = [
    { kind: 'launch' as const, label: 'Salida', value: launch },
    { kind: 'purchase' as const, label: 'Mi compra', value: paid },
    { kind: 'current' as const, label: 'Actual', value: current },
  ].filter((point): point is PriceReference => point.value !== null);
  return {
    paid, launch, current, historicLow, points,
    isFreeToPlay: hasGameTag(game.tags, 'free-to-play'),
    purchaseComparison: getPurchasePriceComparison(paid, launch),
    dlcs: getDlcPriceComparison(game.dlcs?.items),
    hasDlcs: Boolean(game.dlcs?.items?.length || game.dlcs?.total),
  };
}
export type GameMarketView = ReturnType<typeof getGameMarketView>;
