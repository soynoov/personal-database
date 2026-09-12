import { formatEuro } from './game-finance';

export type PriceBalanceState = 'loss' | 'gain' | 'neutral' | 'unavailable';

export const parsePrice = (value: unknown): number | null => {
  if (value === null || value === undefined || typeof value === 'boolean' || (typeof value === 'string' && !value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/** Change in replacement price, not resale proceeds or amortization through use. */
export function getPriceBalance(paid: number | null, current: number | null) {
  if (paid === null || current === null || !Number.isFinite(paid) || !Number.isFinite(current) || paid < 0 || current < 0) {
    return { state: 'unavailable' as PriceBalanceState, difference: null, percent: null };
  }
  const difference = Number((current - paid).toFixed(2));
  return {
    state: (difference < 0 ? 'loss' : difference > 0 ? 'gain' : 'neutral') as PriceBalanceState,
    difference,
    // A free acquisition has no non-zero cost basis for a percentage return.
    percent: paid > 0 ? Number((difference / paid * 100).toFixed(1)) : null,
  };
}

export const formatSignedEuro = (value: number | null) => value === null ? 'Sin comparar'
  : `${value < 0 ? '−' : value > 0 ? '+' : ''}${formatEuro(Math.abs(value))}`;

export const formatSignedPercent = (value: number | null) => value === null ? 'Sin coste inicial'
  : `${value < 0 ? '−' : value > 0 ? '+' : ''}${Math.abs(value).toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`;
