/**
 * catalog.ts
 * Lógica cliente del catálogo: filtrado, renderizado de cards/tabla,
 * navegación y handlers de eventos.
 *
 * Punto de entrada: initCatalog(games)
 * Los datos llegan serializados desde index.astro via atributo data-games.
 */

import { buildGameCoverUrl } from "../lib/game-cover-url";
import type { CatalogGame } from "../lib/catalog-game";
import { isCompletedStatus, normalizeStatus } from "../lib/game-status";

// ─── Tipos ────────────────────────────────────────────────────────────────────

// ─── Utilidades generales ─────────────────────────────────────────────────────

const formatValue = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const textMatch = (value: unknown, search: string): boolean => {
  if (!search) return true;
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(search.toLowerCase());
};

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const matchesSoloFilter = (value: boolean | null | undefined, filter: string): boolean => {
  if (!filter) return true;
  if (filter === 'true') return value === true;
  if (filter === 'false') return value === false;
  return false;
};

const getCoverUrl = (game: CatalogGame): string => buildGameCoverUrl(game);

// ─── Iconos y clases de badges ────────────────────────────────────────────────

const LAUNCHER_ICONS: Record<string, string> = {
  steam: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z"/><path fill="currentColor" d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048"/></svg>',
  'epic games': '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M4.719 0c-1.833 0-2.505.677-2.505 2.505v22.083c0 .209.011.401.027.579.047.401.047.792.421 1.229.036.052.412.328.412.328.203.099.343.172.572.265l11.115 4.656c.573.261.819.371 1.235.355h.005c.421.016.667-.093 1.24-.355l11.109-4.656c.235-.093.369-.167.577-.265 0 0 .376-.287.412-.328.375-.437.375-.828.421-1.229.016-.177.027-.369.027-.573v-22.088c0-1.828-.677-2.505-2.505-2.505zM22.527 4.145h.905c1.511 0 2.251.735 2.251 2.267v2.505H23.85v-2.407c0-.489-.224-.713-.699-.713h-.312c-.489 0-.713.224-.713.713v7.749c0 .489.224.713.713.713h.349c.468 0 .692-.224.692-.713v-2.771h1.833v2.86c0 1.525-.749 2.276-2.265 2.276h-.921c-1.521 0-2.267-.756-2.267-2.276v-7.923c0-1.525.745-2.281 2.267-2.281zM6.276 4.251h4.151v1.703H8.14v3.468h2.204v1.699H8.14v3.697h2.319v1.704H6.276zM11.364 4.251h2.928c1.515 0 2.265.755 2.265 2.28v3.261c0 1.525-.751 2.276-2.265 2.276h-1.057v4.453h-1.871zM17.401 4.251h1.864v12.271h-1.864zM13.229 5.901v4.52H14c.469 0 .693-.228.693-.719v-3.083c0-.489-.224-.719-.693-.719zM10.683 27.615h10.681l-5.452 1.797z"/></svg>',
  'riot games': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.534 21.77l-1.09-2.81 10.52.54-.451 4.5zM15.06 0 .307 6.969 2.59 17.471H5.6l-.52-7.512.461-.144 1.81 7.656h3.126l-.116-9.15.462-.144 1.582 9.294h3.31l.78-11.053.462-.144.82 11.197h4.376l1.54-15.37Z"/></svg>',
  hoyoverse: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m25.9053 34.0474c5.0425-1.4728 6.8196-1.2987 8.3484-1.2948 1.1339.0029 2.2586-.203 3.2921-.6696l.1333-.0602c4.4766-2.0212 6.1813-7.5024 3.6311-11.7001-3.846-6.3305-9.1608-14.0172-11.9794-13.4193-4.7401 1.0056-4.7399 7.1219-4.7399 7.1219s-1.272-.278-4.3376.6715c-3.0947.8498-4.0171 1.7687-4.0171 1.7687s-3.2918-5.1549-7.828-3.4511c-2.6973 1.0131-3.0393 10.3521-2.8734 17.7574.11 4.9105 4.497 8.6125 9.3577 7.9064l.1448-.021c1.1221-.163 2.1809-.5948 3.135-1.2076 1.2864-.8262 2.6904-1.9294 7.7329-3.4022Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m15.9995 38.4489c1.512 3.1381 3.7374 3.1593 5.2644 1.9013 1.527-1.2579 1.6407-4.0191-.0229-6.5644" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m24.4791 30.8374c2.4295-.7096 10.227-.6596 7.9688-6.3871-2.2582-5.7274-5.8688-5.8637-11.1735-4.5849-5.159 1.7775-8.1286 3.8356-6.9491 9.8781 1.1795 6.0425 7.7243 1.8035 10.1538 1.0938Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m19.853 28.218-.9563-3.2738" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m26.9681 26.1398-.9562-3.2738" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m34.7079 32.7399c2.2729 3.9724 2.2263 6.963 2.2263 6.963" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m32.8535 32.7494c-1.4937 4.2834-7.2554 6.9536-12.6733 3.4721" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  hoyoplay: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m25.9053 34.0474c5.0425-1.4728 6.8196-1.2987 8.3484-1.2948 1.1339.0029 2.2586-.203 3.2921-.6696l.1333-.0602c4.4766-2.0212 6.1813-7.5024 3.6311-11.7001-3.846-6.3305-9.1608-14.0172-11.9794-13.4193-4.7401 1.0056-4.7399 7.1219-4.7399 7.1219s-1.272-.278-4.3376.6715c-3.0947.8498-4.0171 1.7687-4.0171 1.7687s-3.2918-5.1549-7.828-3.4511c-2.6973 1.0131-3.0393 10.3521-2.8734 17.7574.11 4.9105 4.497 8.6125 9.3577 7.9064l.1448-.021c1.1221-.163 2.1809-.5948 3.135-1.2076 1.2864-.8262 2.6904-1.9294 7.7329-3.4022Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m15.9995 38.4489c1.512 3.1381 3.7374 3.1593 5.2644 1.9013 1.527-1.2579 1.6407-4.0191-.0229-6.5644" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m24.4791 30.8374c2.4295-.7096 10.227-.6596 7.9688-6.3871-2.2582-5.7274-5.8688-5.8637-11.1735-4.5849-5.159 1.7775-8.1286 3.8356-6.9491 9.8781 1.1795 6.0425 7.7243 1.8035 10.1538 1.0938Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m19.853 28.218-.9563-3.2738" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m26.9681 26.1398-.9562-3.2738" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m34.7079 32.7399c2.2729 3.9724 2.2263 6.963 2.2263 6.963" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="m32.8535 32.7494c-1.4937 4.2834-7.2554 6.9536-12.6733 3.4721" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
  'ea app': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.7 3.4 7.65v8.7L12 21.3l8.6-4.95v-8.7L12 2.7Zm0 1.98 6.8 3.92v6.8L12 19.32 5.2 15.4V8.6L12 4.68Zm-3.3 4.06h5.43v1.48h-3.55v1.23h3.2v1.42h-3.2v1.92H8.7V8.74Zm6.16 0h.94c1.5 0 2.5 1 2.5 2.48 0 1.55-.97 2.57-2.57 2.57h-.87V8.74Zm.93 1.44v2.18h.14c.6 0 .97-.38.97-1.09 0-.72-.37-1.1-.97-1.1h-.14Z"/></svg>',
  nintendo: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M18.901 32h4.901c4.5 0 8.198-3.698 8.198-8.198v-15.604c0-4.5-3.698-8.198-8.198-8.198h-5c-0.099 0-0.203 0.099-0.203 0.198v31.604c0 0.099 0.099 0.198 0.302 0.198zM25 14.401c1.802 0 3.198 1.5 3.198 3.198 0 1.802-1.5 3.198-3.198 3.198-1.802 0-3.198-1.396-3.198-3.198-0.104-1.797 1.396-3.198 3.198-3.198zM15.198 0h-7c-4.5 0-8.198 3.698-8.198 8.198v15.604c0 4.5 3.698 8.198 8.198 8.198h7c0.099 0 0.203-0.099 0.203-0.198v-31.604c0-0.099-0.099-0.198-0.203-0.198zM12.901 29.401h-4.703c-3.099 0-5.599-2.5-5.599-5.599v-15.604c0-3.099 2.5-5.599 5.599-5.599h4.604zM5 9.599c0 1.698 1.302 3 3 3s3-1.302 3-3c0-1.698-1.302-3-3-3s-3 1.302-3 3z"/></svg>',
  switch: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M18.901 32h4.901c4.5 0 8.198-3.698 8.198-8.198v-15.604c0-4.5-3.698-8.198-8.198-8.198h-5c-0.099 0-0.203 0.099-0.203 0.198v31.604c0 0.099 0.099 0.198 0.302 0.198zM25 14.401c1.802 0 3.198 1.5 3.198 3.198 0 1.802-1.5 3.198-3.198 3.198-1.802 0-3.198-1.396-3.198-3.198-0.104-1.797 1.396-3.198 3.198-3.198zM15.198 0h-7c-4.5 0-8.198 3.698-8.198 8.198v15.604c0 4.5 3.698 8.198 8.198 8.198h7c0.099 0 0.203-0.099 0.203-0.198v-31.604c0-0.099-0.099-0.198-0.203-0.198zM12.901 29.401h-4.703c-3.099 0-5.599-2.5-5.599-5.599v-15.604c0-3.099 2.5-5.599 5.599-5.599h4.604zM5 9.599c0 1.698 1.302 3 3 3s3-1.302 3-3c0-1.698-1.302-3-3-3s-3 1.302-3 3z"/></svg>',
  'nintendo switch': '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M18.901 32h4.901c4.5 0 8.198-3.698 8.198-8.198v-15.604c0-4.5-3.698-8.198-8.198-8.198h-5c-0.099 0-0.203 0.099-0.203 0.198v31.604c0 0.099 0.099 0.198 0.302 0.198zM25 14.401c1.802 0 3.198 1.5 3.198 3.198 0 1.802-1.5 3.198-3.198 3.198-1.802 0-3.198-1.396-3.198-3.198-0.104-1.797 1.396-3.198 3.198-3.198zM15.198 0h-7c-4.5 0-8.198 3.698-8.198 8.198v15.604c0 4.5 3.698 8.198 8.198 8.198h7c0.099 0 0.203-0.099 0.203-0.198v-31.604c0-0.099-0.099-0.198-0.203-0.198zM12.901 29.401h-4.703c-3.099 0-5.599-2.5-5.599-5.599v-15.604c0-3.099 2.5-5.599 5.599-5.599h4.604zM5 9.599c0 1.698 1.302 3 3 3s3-1.302 3-3c0-1.698-1.302-3-3-3s-3 1.302-3 3z"/></svg>',
};

const LAUNCHER_CLASS_MAP: Record<string, string> = {
  steam: 'badge-launcher-steam',
  'epic games': 'badge-launcher-epic',
  epic: 'badge-launcher-epic',
  nintendo: 'badge-launcher-nintendo',
  switch: 'badge-launcher-nintendo',
  'nintendo switch': 'badge-launcher-nintendo',
  'nintendo eshop': 'badge-launcher-eshop',
  eshop: 'badge-launcher-eshop',
  pirata: 'badge-launcher-pirata',
  gamepass: 'badge-launcher-gamepass',
  'xbox game pass': 'badge-launcher-gamepass',
  'riot games': 'badge-launcher-riot',
  hoyoverse: 'badge-launcher-hoyoplay',
  hoyoplay: 'badge-launcher-hoyoplay',
  'ea app': 'badge-launcher-ea',
  ubisoft: 'badge-launcher-ubisoft',
  'ubisoft connect': 'badge-launcher-ubisoft',
  gog: 'badge-launcher-gog',
  itch: 'badge-launcher-itch',
  'itch.io': 'badge-launcher-itch',
};

const STATUS_CLASS_MAP: Record<string, string> = {
  pendiente: 'badge-status-pending',
  jugando: 'badge-status-playing',
  terminado: 'badge-status-completed',
  completado: 'badge-status-completed',
  recurrente: 'badge-status-recurring',
  wishlist: 'badge-status-wishlist',
  pausado: 'badge-status-paused',
  abandonado: 'badge-status-abandoned',
  retirado: 'badge-status-abandoned',
};

const PLATFORM_CLASS_MAP: Record<string, string> = {
  pc: 'badge-platform-pc',
  mobile: 'badge-platform-mobile',
  móvil: 'badge-platform-mobile',
  android: 'badge-platform-mobile',
  ios: 'badge-platform-mobile',
  switch: 'badge-platform-switch',
  'nintendo switch': 'badge-platform-switch',
  nintendo: 'badge-platform-switch',
};

const PLATFORMS_WITH_ICON = new Set(['switch', 'nintendo switch', 'nintendo']);

const launcherInlineIcon = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  const svg = LAUNCHER_ICONS[normalized];
  if (!svg) return '';
  return `<span class="launcher-inline-icon" aria-hidden="true">${svg}</span>`;
};

const launcherBadgeContent = (value: unknown): string => {
  const label = formatValue(value, 'Sin launcher');
  const icon = launcherInlineIcon(String(value ?? ''));
  return `${icon}<span>${escapeHtml(label)}</span>`;
};

const statusClassName = (value: unknown): string =>
  STATUS_CLASS_MAP[normalizeStatus(value)] ?? 'badge-status-default';

const launcherClassName = (value: unknown): string =>
  LAUNCHER_CLASS_MAP[normalizeStatus(value)] ?? 'badge-launcher-default';

const platformClassName = (value: unknown): string =>
  PLATFORM_CLASS_MAP[normalizeStatus(value)] ?? 'badge-platform-default';

// ─── Lógica de precios y tags ─────────────────────────────────────────────────

const hasFreeToPlayTag = (game: CatalogGame): boolean =>
  Array.isArray(game.tags) &&
  game.tags.some((tag) => String(tag).toLowerCase() === 'free-to-play');

const hasEarlyAccess = (game: CatalogGame): boolean =>
  Array.isArray(game.generos) &&
  game.generos.some((g) => {
    const n = String(g).toLowerCase();
    return n === 'acceso anticipado' || n === 'early access';
  });

const getReferencePrice = (game: CatalogGame): number | null => {
  if (game.precio_actual != null && game.precio_actual !== '') return Number(game.precio_actual);
  if (game.precio_salida != null && game.precio_salida !== '') return Number(game.precio_salida);
  return null;
};

const getPriceFilterBucket = (game: CatalogGame): string => {
  if (hasFreeToPlayTag(game)) return 'free';
  if (game.precio_pagado == null || game.precio_pagado === '') return 'unknown';
  const paid = Number(game.precio_pagado);
  if (Number.isNaN(paid)) return 'unknown';
  if (paid <= 10) return 'cheap';
  if (paid <= 30) return 'mid';
  return 'high';
};

const getPaidPriceVisual = (game: CatalogGame): { className: string; note: string } => {
  if (hasFreeToPlayTag(game)) return { className: 'detail-item-price-free', note: 'Entrada sin coste' };
  if (game.precio_pagado == null || game.precio_pagado === '') return { className: '', note: '' };

  const paid = Number(game.precio_pagado);
  const reference = getReferencePrice(game);
  if (Number.isNaN(paid) || reference === null || Number.isNaN(reference) || reference <= 0)
    return { className: 'detail-item-price-neutral', note: '' };

  const delta = Number((reference - paid).toFixed(2));
  const ratio = delta / reference;
  const percent = Math.abs(ratio) * 100;
  const sourceLabel = game.precio_actual != null && game.precio_actual !== '' ? 'actual' : 'de salida';

  if (Math.abs(ratio) < 0.12)
    return { className: 'detail-item-price-neutral', note: `${delta >= 0 ? '+' : '-'}${percent.toFixed(1)}% frente al precio ${sourceLabel}` };
  if (delta > 0) {
    if (ratio >= 0.5)
      return { className: 'detail-item-price-profit-strong', note: `+${percent.toFixed(1)}% y ${delta.toFixed(2)} EUR por debajo del precio ${sourceLabel}` };
    return { className: 'detail-item-price-profit', note: `+${percent.toFixed(1)}% y ${delta.toFixed(2)} EUR por debajo del precio ${sourceLabel}` };
  }
  if (ratio <= -0.5)
    return { className: 'detail-item-price-loss-strong', note: `-${percent.toFixed(1)}% y ${Math.abs(delta).toFixed(2)} EUR por encima del precio ${sourceLabel}` };
  return { className: 'detail-item-price-loss', note: `-${percent.toFixed(1)}% y ${Math.abs(delta).toFixed(2)} EUR por encima del precio ${sourceLabel}` };
};

const formatViewPrice = (game: CatalogGame): string => {
  if (hasFreeToPlayTag(game)) return 'Free to play';
  if (game.precio_pagado == null || game.precio_pagado === '') return '-';
  const amount = Number(game.precio_pagado);
  if (Number.isNaN(amount)) return String(game.precio_pagado);
  return `${amount.toFixed(2)} EUR`;
};

// ─── Filtros rápidos ──────────────────────────────────────────────────────────

const STATUS_QUICK_FILTERS = new Set(['terminado', 'jugando', 'pendiente', 'wishlist']);
const QUICK_ONLY_FILTERS = new Set(['profit', 'loss', 'early']);

const matchesQuickFilter = (game: CatalogGame, quickFilter: string): boolean => {
  if (!quickFilter) return true;
  if (quickFilter === 'free') return hasFreeToPlayTag(game);
  if (quickFilter === 'early') return hasEarlyAccess(game);
  if (quickFilter === 'profit' || quickFilter === 'loss') {
    const visual = getPaidPriceVisual(game);
    return quickFilter === 'profit' ? visual.className.includes('profit') : visual.className.includes('loss');
  }
  if (quickFilter === 'terminado') return isCompletedStatus(game.estado);
  return normalizeStatus(game.estado) === quickFilter;
};

// ─── Constructores de DOM ─────────────────────────────────────────────────────

const createBadge = (text: string, className: string): HTMLElement => {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`;
  badge.textContent = formatValue(text);
  return badge;
};

// ─── initCatalog ──────────────────────────────────────────────────────────────

export function initCatalog(allGames: CatalogGame[]): void {
  const el = <T extends Element>(selector: string) =>
    document.querySelector<T>(selector)!;

  const elements = {
    search: el<HTMLInputElement>('#search'),
    estado: el<HTMLSelectElement>('#estado'),
    launcher: el<HTMLSelectElement>('#launcher'),
    plataforma: el<HTMLSelectElement>('#plataforma'),
    solo: el<HTMLSelectElement>('#solo'),
    sort: el<HTMLSelectElement>('#sort'),
    precio: el<HTMLSelectElement>('#precio'),
    mobileFilterToggle: document.querySelector<HTMLElement>('#mobile-filter-toggle'),
    mobileExtraFilters: document.querySelector<HTMLElement>('#mobile-extra-filters'),
    reset: el<HTMLButtonElement>('#reset-filters'),
    cards: el<HTMLElement>('#cards'),
    template: el<HTMLTemplateElement>('#card-template'),
    tableShell: el<HTMLElement>('#table-shell'),
    tableBody: el<HTMLElement>('#table-body'),
    tableTemplate: el<HTMLTemplateElement>('#table-row-template'),
    results: el<HTMLElement>('#results-count'),
    activeFilterPills: el<HTMLElement>('#active-filter-pills'),
    quickFilters: Array.from(document.querySelectorAll<HTMLElement>('[data-quick-filter]')),
    viewButtons: Array.from(document.querySelectorAll<HTMLElement>('[data-view]')),
  };

  // Restaurar params de URL
  const params = new URLSearchParams(window.location.search);
  for (const key of ['search', 'estado', 'launcher', 'plataforma', 'solo', 'sort', 'precio']) {
    const el = elements[key as keyof typeof elements] as HTMLInputElement | HTMLSelectElement | null;
    const value = params.get(key);
    if (el && value) el.value = value;
  }
  if (!elements.sort.value) elements.sort.value = 'horas-desc';

  let activeQuickFilter = '';
  let activeView = params.get('view') === 'table' ? 'table' : 'cards';
  let mobileExtraFiltersOpen = false;

  // ─── Helpers de vista ──────────────────────────────────────────────────────

  const isQuickChipActive = (chipValue: string, filters: Record<string, string>): boolean => {
    if (chipValue === '') return filters.estado === '' && filters.precio === '' && !activeQuickFilter;
    if (STATUS_QUICK_FILTERS.has(chipValue)) {
      return chipValue === 'terminado'
        ? isCompletedStatus(filters.estado)
        : normalizeStatus(filters.estado) === chipValue;
    }
    if (chipValue === 'free') return filters.precio === 'free';
    return activeQuickFilter === chipValue;
  };

  const updateViewMode = (): void => {
    const isTable = activeView === 'table';
    elements.cards.hidden = isTable;
    elements.tableShell.hidden = !isTable;
    elements.cards.style.display = isTable ? 'none' : '';
    elements.tableShell.style.display = isTable ? '' : 'none';
    elements.viewButtons.forEach((button) => {
      const active = (button as HTMLElement).dataset.view === activeView;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  // ─── Detail dialog ─────────────────────────────────────────────────────────

  const render = (): void => {
    const filters = {
      search: elements.search.value.trim(),
      estado: elements.estado.value,
      launcher: elements.launcher.value,
      plataforma: elements.plataforma.value,
      solo: elements.solo.value,
      sort: elements.sort.value,
      precio: elements.precio.value,
    };

    const filtered = allGames
      .filter((game) => {
        const searchMatch =
          textMatch(game.titulo, filters.search) ||
          textMatch(game.launcher, filters.search) ||
          textMatch(Array.isArray(game.generos) ? game.generos.join(', ') : '', filters.search);

        return (
          searchMatch &&
          matchesQuickFilter(game, activeQuickFilter) &&
          (!filters.estado ||
            (isCompletedStatus(filters.estado)
              ? isCompletedStatus(game.estado)
              : normalizeStatus(game.estado) === normalizeStatus(filters.estado))) &&
          textMatch(game.launcher, filters.launcher) &&
          textMatch(game.plataforma, filters.plataforma) &&
          (filters.precio ? getPriceFilterBucket(game) === filters.precio : true) &&
          matchesSoloFilter(game.solo, filters.solo)
        );
      })
      .sort((a, b) => {
        if (filters.sort === 'horas-desc') return Number(b.horas ?? -1) - Number(a.horas ?? -1);
        if (filters.sort === 'lanzamiento-desc') return Number(b.lanzamiento ?? -1) - Number(a.lanzamiento ?? -1);
        return String(a.titulo).localeCompare(String(b.titulo), 'es');
      });

    elements.results.textContent = String(filtered.length);
    const mobileSubEl = document.querySelector('#mobile-topbar-sub');
    if (mobileSubEl) {
      mobileSubEl.textContent =
        filtered.length === allGames.length
          ? `${allGames.length} juegos`
          : `${filtered.length} de ${allGames.length}`;
    }

    // Pills de filtros activos
    const activeFilterEntries = Object.entries(filters).filter(([key, value]) => key !== 'sort' && value);
    if (activeQuickFilter && QUICK_ONLY_FILTERS.has(activeQuickFilter)) {
      const quickFilterLabels: Record<string, string> = {
        terminado: 'destacado=Terminado', jugando: 'destacado=Jugando',
        pendiente: 'destacado=Pendiente', free: 'destacado=Free to play',
        profit: 'destacado=Buena compra', loss: 'destacado=Mala compra',
        early: 'destacado=Early Access',
      };
      activeFilterEntries.push(['quick', quickFilterLabels[activeQuickFilter] ?? activeQuickFilter]);
    }
    const estadoPillColors: Record<string, string> = {
      jugando: '#6ee76c', terminado: '#67b1ff', completado: '#67b1ff',
      pendiente: '#f5c518', wishlist: '#5ad0ff', pausado: '#f5a818',
      abandonado: '#ff7055', retirado: '#ff7055', recurrente: '#c9a0ff',
    };

    if (activeFilterEntries.length > 0) {
      elements.activeFilterPills.hidden = false;
      elements.activeFilterPills.replaceChildren();

      for (const [key, value] of activeFilterEntries) {
        const button = document.createElement('button');
        button.className = 'active-filter-pill';
        button.type = 'button';
        button.dataset.filterRemove = key;

        let label: string;
        if (key === 'quick') {
          label = String(value).replace('destacado=', '');
        } else if (key === 'estado') {
          label = String(value);
          const dot = document.createElement('span');
          dot.className = 'active-pill-dot';
          dot.style.background = estadoPillColors[normalizeStatus(value)] ?? '#8b9ab5';
          dot.setAttribute('aria-hidden', 'true');
          button.appendChild(dot);
        } else {
          label = `${key}: ${value}`;
        }

        button.appendChild(document.createTextNode(label));

        const remove = document.createElement('span');
        remove.className = 'active-pill-remove';
        remove.setAttribute('aria-hidden', 'true');
        remove.textContent = '×';
        button.appendChild(remove);

        elements.activeFilterPills.appendChild(button);
      }
    } else {
      elements.activeFilterPills.hidden = true;
      elements.activeFilterPills.replaceChildren();
    }

    // Quick filter chips
    elements.quickFilters.forEach((chip) => {
      const chipActive = isQuickChipActive((chip as HTMLElement).dataset.quickFilter ?? '', filters);
      chip.classList.toggle('is-active', chipActive);
      chip.setAttribute('aria-pressed', chipActive ? 'true' : 'false');
    });

    // URL params
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) nextParams.set(key, value);
    }
    if (activeView !== 'cards') nextParams.set('view', activeView);
    const query = nextParams.toString();
    history.replaceState({}, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);

    // Mobile extra filters toggle
    if (elements.mobileExtraFilters && elements.mobileFilterToggle) {
      elements.mobileExtraFilters.classList.toggle('is-open', mobileExtraFiltersOpen);
      elements.mobileFilterToggle.setAttribute('aria-expanded', mobileExtraFiltersOpen ? 'true' : 'false');
    }

    // Renderizar cards
    elements.cards.innerHTML = '';
    elements.tableBody.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No hay resultados con esos filtros.';
      elements.cards.appendChild(empty);
      elements.tableBody.appendChild(empty.cloneNode(true));
      updateViewMode();
      return;
    }

    for (const game of filtered) {
      // ── Card ──
      const node = elements.template.content.cloneNode(true) as DocumentFragment;
      node.querySelector('[data-title]')!.textContent = formatValue(game.titulo);

      const kickerPlatform = formatValue(game.plataforma, '');
      const kickerLauncher = formatValue(game.launcher, '');
      const platformBadgesEl = node.querySelector('[data-platform-badges]')!;

      if (kickerPlatform) {
        const normalizedPlatform = normalizeStatus(game.plataforma);
        const platBadge = document.createElement('span');
        platBadge.className = `badge ${platformClassName(game.plataforma)}`;
        const capPlatform = kickerPlatform.replace(/\b\w/g, (c) => c.toUpperCase());
        if (PLATFORMS_WITH_ICON.has(normalizedPlatform)) {
          platBadge.innerHTML = `${launcherInlineIcon(normalizedPlatform)}<span>${escapeHtml(capPlatform)}</span>`;
        } else {
          platBadge.textContent = capPlatform;
        }
        platformBadgesEl.appendChild(platBadge);
      }

      if (kickerLauncher) {
        const launchBadge = document.createElement('span');
        launchBadge.className = `badge ${launcherClassName(game.launcher)}`;
        launchBadge.innerHTML = launcherBadgeContent(game.launcher);
        platformBadgesEl.appendChild(launchBadge);
      }

      // Soporte (año + géneros)
      const supportParts: string[] = [];
      if (game.lanzamiento != null && game.lanzamiento !== '')
        supportParts.push(`<span>${escapeHtml(String(game.lanzamiento))}</span>`);
      if (Array.isArray(game.generos) && game.generos.length > 0)
        supportParts.push(`<span>${escapeHtml(game.generos.slice(0, 2).join(', '))}</span>`);
      node.querySelector('[data-support]')!.innerHTML =
        supportParts.join('<span class="support-separator" aria-hidden="true"> | </span>') || 'Sin contexto';

      // Cover
      const cover = node.querySelector('[data-cover]')!;
      cover.innerHTML = `<img src="${escapeHtml(getCoverUrl(game))}" alt="Caratula de ${String(game.titulo).replace(/"/g, '&quot;')}" loading="lazy" />`;

      // Estado y tags
      const statusBadge = node.querySelector('[data-estado]') as HTMLElement;
      statusBadge.textContent = formatValue(game.estado);
      statusBadge.classList.add(statusClassName(game.estado));
      if (hasFreeToPlayTag(game)) node.querySelector('.badges')!.appendChild(createBadge('Free to play', 'badge-tag-free'));
      if (hasEarlyAccess(game)) node.querySelector('.badges')!.appendChild(createBadge('Early Access', 'badge-tag-early'));

      // Horas
      (node.querySelector('[data-horas]') as HTMLElement).textContent =
        game.horas == null
          ? '-'
          : new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1, useGrouping: true }).format(Number(game.horas));

      // Eventos de la card
      const card = node.querySelector<HTMLAnchorElement>('[data-game-link]')!;
      card.href = `/games/${game.slug}/`;
      card.addEventListener('click', (event) => {
        const isTouch = window.matchMedia('(hover: none)').matches;
        if (isTouch && !card.classList.contains('is-open')) {
          event.preventDefault();
          document.querySelectorAll('.mock-game-card.is-open').forEach((c) => c.classList.remove('is-open'));
          card.classList.add('is-open');
          event.stopPropagation();
        }
      });

      elements.cards.appendChild(node);

      // ── Fila de tabla ──
      const rowNode = elements.tableTemplate.content.cloneNode(true) as DocumentFragment;
      (rowNode.querySelector('[data-row-title]') as HTMLElement).textContent = formatValue(game.titulo);
      (rowNode.querySelector('[data-row-support]') as HTMLElement).textContent =
        Array.isArray(game.generos) && game.generos.length > 0 ? String(game.generos[0]) : 'Sin genero';

      const rowCover = rowNode.querySelector('[data-row-cover]')!;
      rowCover.innerHTML = `<img src="${escapeHtml(getCoverUrl(game))}" alt="" aria-hidden="true" loading="lazy" />`;

      const rowStatus = rowNode.querySelector('[data-row-estado]') as HTMLElement;
      rowStatus.textContent = formatValue(game.estado);
      rowStatus.classList.add(statusClassName(game.estado));

      const rowLauncher = rowNode.querySelector('[data-row-launcher]') as HTMLElement;
      rowLauncher.innerHTML = launcherBadgeContent(game.launcher);
      rowLauncher.classList.add(launcherClassName(game.launcher));

      const rowPlatform = rowNode.querySelector('[data-row-plataforma]') as HTMLElement;
      rowPlatform.textContent = formatValue(game.plataforma);
      rowPlatform.classList.add(platformClassName(game.plataforma));

      (rowNode.querySelector('[data-row-horas]') as HTMLElement).textContent =
        game.horas == null ? '-' : `${game.horas} h`;
      (rowNode.querySelector('[data-row-precio]') as HTMLElement).textContent = formatViewPrice(game);
      (rowNode.querySelector('[data-row-lanzamiento]') as HTMLElement).textContent = formatValue(game.lanzamiento);

      const row = rowNode.querySelector<HTMLAnchorElement>('[data-row-link]')!;
      row.href = `/games/${game.slug}/`;

      elements.tableBody.appendChild(rowNode);
    }

    // Sincronizar drawer
    document.querySelectorAll<HTMLElement>('[data-drawer-filter]').forEach((item) => {
      const filter = item.dataset.drawerFilter;
      const value = item.dataset.value ?? '';
      let active = false;
      if (filter === 'sort') active = elements.sort.value === value;
      else if (filter === 'estado') active = normalizeStatus(elements.estado.value) === normalizeStatus(value);
      else if (filter === 'launcher') active = elements.launcher.value === value;
      else if (filter === 'plataforma') active = elements.plataforma.value === value;
      item.classList.toggle('is-active', active);
    });

    updateViewMode();
  };

  // ─── Event listeners ───────────────────────────────────────────────────────

  [elements.search, elements.estado, elements.launcher, elements.plataforma, elements.solo, elements.sort, elements.precio]
    .forEach((el) => { el.addEventListener('input', render); el.addEventListener('change', render); });

  elements.reset.addEventListener('click', () => {
    elements.search.value = '';
    elements.estado.value = '';
    elements.launcher.value = '';
    elements.plataforma.value = '';
    elements.solo.value = '';
    elements.sort.value = 'horas-desc';
    elements.precio.value = '';
    activeQuickFilter = '';
    mobileExtraFiltersOpen = false;
    render();
  });

  elements.activeFilterPills.addEventListener('click', (event) => {
    const pill = (event.target as HTMLElement).closest<HTMLElement>('[data-filter-remove]');
    if (!pill) return;
    const key = pill.dataset.filterRemove!;
    if (key === 'search') elements.search.value = '';
    if (key === 'estado') elements.estado.value = '';
    if (key === 'launcher') elements.launcher.value = '';
    if (key === 'plataforma') elements.plataforma.value = '';
    if (key === 'solo') elements.solo.value = '';
    if (key === 'precio') elements.precio.value = '';
    if (key === 'quick') activeQuickFilter = '';
    render();
  });

  elements.quickFilters.forEach((chip) => {
    chip.addEventListener('click', () => {
      const nextValue = (chip as HTMLElement).dataset.quickFilter ?? '';
      if (nextValue === '') {
        elements.estado.value = '';
        elements.precio.value = '';
        activeQuickFilter = '';
      } else if (STATUS_QUICK_FILTERS.has(nextValue)) {
        const isActive = nextValue === 'terminado'
          ? isCompletedStatus(elements.estado.value)
          : normalizeStatus(elements.estado.value) === nextValue;
        const matchingOption = Array.from(elements.estado.options).find((option) =>
          nextValue === 'terminado'
            ? isCompletedStatus(option.value)
            : normalizeStatus(option.value) === nextValue,
        );
        elements.estado.value = isActive ? '' : (matchingOption?.value ?? '');
        activeQuickFilter = '';
      } else if (nextValue === 'free') {
        elements.precio.value = elements.precio.value === 'free' ? '' : 'free';
      } else if (QUICK_ONLY_FILTERS.has(nextValue)) {
        activeQuickFilter = activeQuickFilter === nextValue ? '' : nextValue;
      }
      render();
    });
  });

  elements.mobileFilterToggle?.addEventListener('click', () => {
    mobileExtraFiltersOpen = !mobileExtraFiltersOpen;
    render();
  });

  elements.viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeView = (button as HTMLElement).dataset.view === 'table' ? 'table' : 'cards';
      render();
    });
  });

  // Mobile drawer
  const drawerEl = document.querySelector('#mobile-drawer');
  const drawerOverlay = document.querySelector('#mobile-drawer-overlay');
  const drawerCloseBtn = document.querySelector('#mobile-drawer-close');
  const drawerOpenBtn = document.querySelector('#mobile-drawer-open');

  const openMobileDrawer = () => {
    drawerEl?.classList.add('is-open');
    drawerEl?.setAttribute('aria-hidden', 'false');
    drawerOverlay?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileDrawer = () => {
    drawerEl?.classList.remove('is-open');
    drawerEl?.setAttribute('aria-hidden', 'true');
    drawerOverlay?.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  drawerOpenBtn?.addEventListener('click', openMobileDrawer);
  drawerCloseBtn?.addEventListener('click', closeMobileDrawer);
  drawerOverlay?.addEventListener('click', closeMobileDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileDrawer(); });

  document.querySelectorAll<HTMLElement>('[data-drawer-filter]').forEach((item) => {
    item.addEventListener('click', () => {
      const filter = item.dataset.drawerFilter;
      const value = item.dataset.value ?? '';
      if (filter === 'sort') elements.sort.value = value;
      else if (filter === 'estado') { elements.estado.value = value; activeQuickFilter = ''; }
      else if (filter === 'launcher') elements.launcher.value = value;
      else if (filter === 'plataforma') elements.plataforma.value = value;
      closeMobileDrawer();
      render();
    });
  });

  // Cerrar card abierta en touch al tocar fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.mock-game-card.is-open').forEach((c) => c.classList.remove('is-open'));
  });

  render();
}
