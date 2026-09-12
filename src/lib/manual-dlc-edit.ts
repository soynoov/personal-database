import type { LocalGame } from './local-games';
import { isAcquiredDlc } from './game-finance';

type DlcItem = NonNullable<NonNullable<LocalGame['dlcs']>['items']>[number];

export function applyManualDlcPatch(item: DlcItem, patch: Record<string, unknown> | null | undefined, today: string): DlcItem {
  if (!patch) return item;
  if (patch.owned !== true) return { ...item, fecha_adquisicion: null, precio_pagado: null };
  const dateText = typeof patch.fecha_adquisicion === 'string' ? patch.fecha_adquisicion.trim() : '';
  const suppliedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : null;
  const rawPrice = patch.precio_pagado;
  const price = rawPrice === null || rawPrice === undefined || String(rawPrice).trim() === '' ? null : Number(rawPrice);
  return {
    ...item,
    // Editing a previously purchased DLC must not invent its missing purchase date.
    fecha_adquisicion: suppliedDate ?? (isAcquiredDlc(item) ? item.fecha_adquisicion ?? null : today),
    precio_pagado: price !== null && Number.isFinite(price) ? price : null,
  };
}
