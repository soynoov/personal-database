import type { LocalGame } from './local-games';
import { getPurchasedUnits } from './local-games';
import { getPurchasePriceComparison, isAcquiredDlc } from './game-finance';
import { hasGameTag } from './game-tags';
import { normalizeStatus } from './game-status';
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
    missingPaidCount: acquired.filter(dlc => price(dlc.precio_pagado) === null).length,
    missingCurrentCount: acquired.filter(dlc => price(dlc.precio_actual) === null).length,
    paidTotal, currentTotal,
    balance, difference: balance.difference,
    pendingCount: pending.length, pendingKnownCount: pendingPrices.length,
    pendingTotal: pendingPrices.length ? sum(pendingPrices) : null,
  };
}

export function getGameMarketView(game: LocalGame) {
  const paid = price(game.precio_pagado);
  const launch = price(game.precio_salida);
  const current = price(game.precio_actual);
  const historicLow = price(game.precio_minimo_historico);
  const isFreeToPlay = hasGameTag(game.tags, 'free-to-play');
  const purchasedUnits = getPurchasedUnits(game);
  // Wishlist is not an acquisition; a recorded payment still establishes one.
  // An unset status must not hide an unknown base cost from the pending notice.
  const baseApplicable = !isFreeToPlay && (paid !== null || normalizeStatus(game.estado) !== 'wishlist');
  const baseIncluded = baseApplicable && paid !== null && current !== null;
  const basePaid = baseIncluded ? sum([paid * purchasedUnits]) : null;
  const baseCurrent = baseIncluded ? sum([current * purchasedUnits]) : null;
  const dlcs = getDlcPriceComparison(game.dlcs?.items);
  const hasComparablePurchases = baseIncluded || dlcs.rows.length > 0;
  const paidTotal = hasComparablePurchases ? sum([basePaid ?? 0, dlcs.paidTotal ?? 0]) : null;
  const currentTotal = hasComparablePurchases ? sum([baseCurrent ?? 0, dlcs.currentTotal ?? 0]) : null;
  const excludedCount = (baseApplicable && !baseIncluded ? 1 : 0) + dlcs.excludedCount;
  const cohortParts = [
    ...(baseIncluded ? [purchasedUnits > 1 ? `Juego base (${purchasedUnits} copias)` : 'Juego base'] : []),
    ...(dlcs.rows.length > 0 ? [`${dlcs.rows.length} DLC`] : []),
  ];
  const points = [
    { kind: 'launch' as const, label: 'Salida', value: launch },
    { kind: 'purchase' as const, label: 'Mi compra', value: paid },
    { kind: 'current' as const, label: 'Actual', value: current },
  ].filter((point): point is PriceReference => point.value !== null);
  return {
    paid, launch, current, historicLow, points,
    isFreeToPlay, purchasedUnits, baseApplicable,
    baseBalance: getPriceBalance(basePaid, baseCurrent),
    baseUnitBalance: getPriceBalance(paid, current),
    purchaseBalance: {
      paidTotal, currentTotal, balance: getPriceBalance(paidTotal, currentTotal),
      baseIncluded, includedDlcCount: dlcs.rows.length, excludedCount,
      partial: excludedCount > 0,
      cohortLabel: cohortParts.length ? `${cohortParts.join(' + ')} · mismos productos comparables` : 'Sin compras con ambos precios registrados',
    },
    purchaseComparison: getPurchasePriceComparison(paid, current),
    dlcs,
    hasDlcs: Boolean(game.dlcs?.items?.length || game.dlcs?.total),
  };
}
export type GameMarketView = ReturnType<typeof getGameMarketView>;
