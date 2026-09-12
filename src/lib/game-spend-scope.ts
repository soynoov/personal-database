import type { GameValueMetrics } from './game-finance';
import type { GameMarketView } from './game-market-view';

/** Explain the existing totals, without changing purchase or usage calculations. */
export function getGameSpendScope(metrics: GameValueMetrics, market: GameMarketView) {
  const comparable = market.purchaseBalance.paidTotal;
  const unpaired = Math.max(0, Number((metrics.recordedSpend - (comparable ?? 0) - metrics.microtransactionSpend).toFixed(2)));
  return {
    total: metrics.recordedSpend,
    comparable,
    unpaired,
    microtransactions: metrics.microtransactionSpend,
    differs: unpaired > 0 || metrics.microtransactionSpend > 0,
    provisional: metrics.usageProvisional,
  };
}
