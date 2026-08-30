/**
 * catalog.ts
 * Lógica cliente del catálogo: filtrado, renderizado de cards/tabla,
 * navegación y handlers de eventos.
 *
 * Punto de entrada: initCatalog(games)
 * Los datos llegan serializados desde index.astro via atributo data-games.
 */

import { buildGameCoverUrl } from "../lib/game-cover-url";
import { hasCompletedAllAchievements } from "../lib/game-achievements";
import type { CatalogGame } from "../lib/catalog-game";
import { isCompletedStatus, normalizeStatus } from "../lib/game-status";
import { getGameTagLabel, hasGameTag, normalizeGameTag } from "../lib/game-tags";
import { gameHasMode, getGameModeLabel, getGameModes } from "../lib/game-modes";

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

const matchesModeFilter = (game: CatalogGame, filter: string): boolean =>
  !filter || gameHasMode(game, filter);

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
  hasGameTag(game.tags, 'free-to-play');

const hasEarlyAccess = (game: CatalogGame): boolean =>
  hasGameTag(game.tags, 'early-access') ||
  (Array.isArray(game.generos) &&
    game.generos.some((g) => {
      const n = String(g).toLowerCase();
      return n === 'acceso anticipado' || n === 'early access';
    }));

const matchesTagFilter = (game: CatalogGame, filter: string): boolean => {
  if (!filter) return true;
  if (hasGameTag(game.tags, filter)) return true;
  return normalizeGameTag(filter) === 'early-access' && hasEarlyAccess(game);
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

const formatViewPrice = (game: CatalogGame): string => {
  if (hasFreeToPlayTag(game)) return 'Free to play';
  if (game.precio_pagado == null || game.precio_pagado === '') return '-';
  const amount = Number(game.precio_pagado);
  if (Number.isNaN(amount)) return String(game.precio_pagado);
  return `${amount.toFixed(2)} EUR`;
};

// ─── Filtros rápidos ──────────────────────────────────────────────────────────

const STATUS_QUICK_FILTERS = new Set(['terminado', 'jugando', 'pendiente', 'wishlist', 'recurrente']);
const TAG_QUICK_FILTERS: Record<string, string> = {
  free: 'free-to-play',
  early: 'early-access',
};
const PROFITABILITY_QUICK_FILTERS: Record<string, CatalogGame['rentabilidad']> = {
  amortized: 'amortized',
};
const DEFAULT_SORT = 'horas-desc';
type SortDirection = 'asc' | 'desc';

const compareText = (a: unknown, b: unknown, direction: SortDirection): number => {
  const result = String(a ?? '').localeCompare(String(b ?? ''), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
  return direction === 'asc' ? result : -result;
};

const compareNumbers = (a: unknown, b: unknown, direction: SortDirection): number => {
  const left = Number(a);
  const right = Number(b);
  const leftMissing = a == null || a === '' || !Number.isFinite(left);
  const rightMissing = b == null || b === '' || !Number.isFinite(right);
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  return direction === 'asc' ? left - right : right - left;
};

const compareCatalogGames = (a: CatalogGame, b: CatalogGame, sort: string): number => {
  const [key, rawDirection] = sort.split('-');
  const direction: SortDirection = rawDirection === 'asc' ? 'asc' : 'desc';
  if (key === 'estado') return compareText(normalizeStatus(a.estado), normalizeStatus(b.estado), direction);
  if (key === 'launcher') return compareText(a.launcher, b.launcher, direction);
  if (key === 'plataforma') return compareText(a.plataforma, b.plataforma, direction);
  if (key === 'horas') return compareNumbers(a.horas, b.horas, direction);
  if (key === 'precio') {
    const leftPrice = hasFreeToPlayTag(a) ? 0 : a.precio_pagado;
    const rightPrice = hasFreeToPlayTag(b) ? 0 : b.precio_pagado;
    return compareNumbers(leftPrice, rightPrice, direction);
  }
  if (key === 'lanzamiento') return compareNumbers(a.lanzamiento, b.lanzamiento, direction);
  return compareText(a.titulo, b.titulo, direction);
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
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const el = <T extends Element>(selector: string) =>
    document.querySelector<T>(selector)!;

  const elements = {
    search: el<HTMLInputElement>('#search'),
    estado: el<HTMLSelectElement>('#estado'),
    launcher: el<HTMLSelectElement>('#launcher'),
    plataforma: el<HTMLSelectElement>('#plataforma'),
    tag: el<HTMLSelectElement>('#tag'),
    modo: el<HTMLSelectElement>('#modo'),
    sort: el<HTMLSelectElement>('#sort'),
    mobileSort: document.querySelector<HTMLSelectElement>('#mobile-sort'),
    precio: el<HTMLSelectElement>('#precio'),
    rentabilidad: el<HTMLSelectElement>('#rentabilidad'),
    mobileFilterToggle: document.querySelector<HTMLButtonElement>('#mobile-filter-toggle'),
    mobileExtraFilters: document.querySelector<HTMLElement>('#mobile-extra-filters'),
    mobileFilterBackdrop: document.querySelector<HTMLButtonElement>('#catalog-filter-backdrop'),
    mobileFilterClose: document.querySelector<HTMLButtonElement>('#catalog-filter-close'),
    mobileFilterApply: document.querySelector<HTMLButtonElement>('#catalog-filter-apply'),
    mobileReset: document.querySelector<HTMLButtonElement>('#reset-filters-mobile'),
    mobileFilterCount: document.querySelector<HTMLElement>('#catalog-filter-count'),
    reset: el<HTMLButtonElement>('#reset-filters'),
    cardsShell: el<HTMLElement>('#cards-shell'),
    cards: el<HTMLElement>('#cards'),
    template: el<HTMLTemplateElement>('#card-template'),
    tableShell: el<HTMLElement>('#table-shell'),
    tableBody: el<HTMLElement>('#table-body'),
    tableTemplate: el<HTMLTemplateElement>('#table-row-template'),
    results: Array.from(document.querySelectorAll<HTMLElement>('[data-results-count]')),
    activeFilterPills: el<HTMLElement>('#active-filter-pills'),
    quickFilters: Array.from(document.querySelectorAll<HTMLElement>('[data-quick-filter]')),
    viewButtons: Array.from(document.querySelectorAll<HTMLElement>('[data-view]')),
    tableSortButtons: Array.from(document.querySelectorAll<HTMLButtonElement>('[data-table-sort]')),
  };

  const modalIsolationTargets = Array.from(document.querySelectorAll<HTMLElement>([
    '.home-catalog-hero',
    '.desktop-sidebar',
    '#cards-shell',
    '#table-shell',
    '.catalog-filters-top',
    '.mobile-sort-bar',
    '.mobile-tab-bar',
    '#active-filter-pills',
    '.panel-subtoolbar',
    '.legend-app',
    '.mobile-bottom-nav',
    '.mobile-drawer',
  ].join(',')));
  const previousAriaHidden = new Map<HTMLElement, string | null>();
  let modalIsolationActive = false;

  // Restaurar params de URL
  const params = new URLSearchParams(window.location.search);
  for (const key of ['search', 'estado', 'launcher', 'plataforma', 'tag', 'modo', 'sort', 'precio', 'rentabilidad']) {
    const el = elements[key as keyof typeof elements] as HTMLInputElement | HTMLSelectElement | null;
    const value = params.get(key);
    if (el && value) el.value = value;
  }
  const legacySolo = params.get('solo');
  if (!params.get('modo') && legacySolo === 'true') elements.modo.value = 'solitario';
  if (!params.get('modo') && legacySolo === 'false') elements.modo.value = 'multijugador';
  if (!elements.sort.value) elements.sort.value = DEFAULT_SORT;
  if (elements.mobileSort) elements.mobileSort.value = elements.sort.value;

  let activeView = params.get('view') === 'table' ? 'table' : 'cards';
  let mobileExtraFiltersOpen = false;

  // ─── Helpers de vista ──────────────────────────────────────────────────────

  const isQuickChipActive = (chipValue: string, filters: Record<string, string>): boolean => {
    if (chipValue === '') {
      return filters.estado === '' && filters.precio === '' && filters.tag === '' && filters.rentabilidad === '';
    }
    if (STATUS_QUICK_FILTERS.has(chipValue)) {
      return chipValue === 'terminado'
        ? isCompletedStatus(filters.estado)
        : normalizeStatus(filters.estado) === chipValue;
    }
    if (TAG_QUICK_FILTERS[chipValue]) {
      return normalizeGameTag(filters.tag) === TAG_QUICK_FILTERS[chipValue];
    }
    if (PROFITABILITY_QUICK_FILTERS[chipValue]) {
      return filters.rentabilidad === PROFITABILITY_QUICK_FILTERS[chipValue];
    }
    return false;
  };

  const usesMobileFilterSheet = (): boolean => window.matchMedia('(max-width: 820px)').matches;

  const setModalIsolation = (active: boolean): void => {
    if (active === modalIsolationActive) return;
    modalIsolationActive = active;
    modalIsolationTargets.forEach((target) => {
      if (active) {
        previousAriaHidden.set(target, target.getAttribute('aria-hidden'));
        target.inert = true;
        target.setAttribute('aria-hidden', 'true');
        return;
      }
      target.inert = false;
      const previous = previousAriaHidden.get(target);
      if (previous == null) target.removeAttribute('aria-hidden');
      else target.setAttribute('aria-hidden', previous);
    });
    if (!active) previousAriaHidden.clear();
  };

  const syncFilterViewportState = (): void => {
    const mobileSheetOpen = mobileExtraFiltersOpen && usesMobileFilterSheet();
    document.body.style.overflow = mobileSheetOpen ? 'hidden' : '';
    setModalIsolation(mobileSheetOpen);

    if (mobileSheetOpen) {
      elements.mobileExtraFilters?.setAttribute('role', 'dialog');
      elements.mobileExtraFilters?.setAttribute('aria-modal', 'true');
      elements.mobileExtraFilters?.setAttribute('aria-labelledby', 'catalog-filter-sheet-title');
    } else {
      elements.mobileExtraFilters?.removeAttribute('role');
      elements.mobileExtraFilters?.removeAttribute('aria-modal');
      elements.mobileExtraFilters?.removeAttribute('aria-labelledby');
    }

    elements.mobileFilterBackdrop?.classList.toggle('is-open', mobileSheetOpen);
    if (elements.mobileFilterBackdrop) elements.mobileFilterBackdrop.hidden = !mobileSheetOpen;
  };

  const updateViewMode = (): void => {
    const isTable = activeView === 'table';
    elements.cardsShell.hidden = isTable;
    elements.cards.hidden = isTable;
    elements.tableShell.hidden = !isTable;
    elements.cardsShell.style.display = isTable ? 'none' : '';
    elements.cards.style.display = isTable ? 'none' : '';
    elements.tableShell.style.display = isTable ? '' : 'none';
    elements.viewButtons.forEach((button) => {
      const active = (button as HTMLElement).dataset.view === activeView;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const closeMobileFilters = (): void => {
    mobileExtraFiltersOpen = false;
    render();
    elements.mobileFilterToggle?.focus();
  };

  // ─── Detail dialog ─────────────────────────────────────────────────────────

  const render = (): void => {
    const filters = {
      search: elements.search.value.trim(),
      estado: elements.estado.value,
      launcher: elements.launcher.value,
      plataforma: elements.plataforma.value,
      tag: elements.tag.value,
      modo: elements.modo.value,
      sort: elements.sort.value,
      precio: elements.precio.value,
      rentabilidad: elements.rentabilidad.value,
    };
    if (elements.mobileSort && elements.mobileSort.value !== filters.sort) {
      elements.mobileSort.value = filters.sort;
    }

    const filtered = allGames
      .filter((game) => {
        const searchMatch =
          textMatch(game.titulo, filters.search) ||
          textMatch(game.launcher, filters.search) ||
          textMatch(Array.isArray(game.generos) ? game.generos.join(', ') : '', filters.search) ||
          textMatch(Array.isArray(game.tags) ? game.tags.map(getGameTagLabel).join(', ') : '', filters.search) ||
          textMatch(getGameModes(game).map(getGameModeLabel).join(', '), filters.search);

        return (
          searchMatch &&
          (!filters.estado ||
            (isCompletedStatus(filters.estado)
              ? isCompletedStatus(game.estado)
              : normalizeStatus(game.estado) === normalizeStatus(filters.estado))) &&
          textMatch(game.launcher, filters.launcher) &&
          textMatch(game.plataforma, filters.plataforma) &&
          matchesTagFilter(game, filters.tag) &&
          (filters.precio ? getPriceFilterBucket(game) === filters.precio : true) &&
          (filters.rentabilidad ? game.rentabilidad === filters.rentabilidad : true) &&
          matchesModeFilter(game, filters.modo)
        );
      })
      .sort((a, b) => compareCatalogGames(a, b, filters.sort));

    elements.results.forEach((result) => { result.textContent = String(filtered.length); });
    const mobileSubEl = document.querySelector('#mobile-topbar-sub');
    if (mobileSubEl) {
      mobileSubEl.textContent =
        filtered.length === allGames.length
          ? `${allGames.length} juegos`
          : `${filtered.length} de ${allGames.length}`;
    }

    // Pills de filtros activos
    const activeFilterEntries = Object.entries(filters).filter(([key, value]) => key !== 'sort' && value);
    const hasCustomSort = filters.sort !== DEFAULT_SORT;
    elements.reset.hidden = activeFilterEntries.length === 0 && !hasCustomSort;
    if (elements.mobileReset) {
      const resetDisabled = activeFilterEntries.length === 0 && !hasCustomSort;
      elements.mobileReset.disabled = resetDisabled;
      elements.mobileReset.setAttribute('aria-disabled', resetDisabled ? 'true' : 'false');
    }
    const mobileFilterCount = activeFilterEntries.filter(([key]) => key !== 'search').length;
    if (elements.mobileFilterCount) {
      elements.mobileFilterCount.textContent = String(mobileFilterCount);
      elements.mobileFilterCount.hidden = mobileFilterCount === 0;
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
        if (key === 'estado') {
          label = String(value);
          const dot = document.createElement('span');
          dot.className = 'active-pill-dot';
          dot.style.background = estadoPillColors[normalizeStatus(value)] ?? '#8b9ab5';
          dot.setAttribute('aria-hidden', 'true');
          button.appendChild(dot);
        } else if (key === 'tag') {
          label = `Etiqueta: ${getGameTagLabel(value)}`;
        } else if (key === 'modo') {
          label = `Modo: ${getGameModeLabel(value)}`;
        } else if (key === 'rentabilidad') {
          const profitabilityLabels: Record<string, string> = {
            amortized: 'Amortizados',
            unamortized: 'No amortizados',
            incomplete: 'Datos incompletos',
          };
          label = `Rentabilidad: ${profitabilityLabels[String(value)] ?? value}`;
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

    const [activeSortKey, activeSortDirection] = filters.sort.split('-');
    elements.tableSortButtons.forEach((button) => {
      const active = button.dataset.tableSort === activeSortKey;
      const label = button.querySelector('span')?.textContent?.trim() ?? 'columna';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute(
        'aria-label',
        active
          ? `Ordenado por ${label}, ${activeSortDirection === 'asc' ? 'ascendente' : 'descendente'}. Cambiar dirección`
          : `Ordenar por ${label}`,
      );
      if (active) button.dataset.direction = activeSortDirection;
      else delete button.dataset.direction;
    });

    // URL params
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (key === 'sort' && value === DEFAULT_SORT) continue;
      if (value) nextParams.set(key, value);
    }
    if (activeView !== 'cards') nextParams.set('view', activeView);
    const query = nextParams.toString();
    history.replaceState({}, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);

    // Mobile extra filters toggle
    if (elements.mobileExtraFilters && elements.mobileFilterToggle) {
      elements.mobileExtraFilters.classList.toggle('is-open', mobileExtraFiltersOpen);
      elements.mobileFilterToggle.classList.toggle('is-active', mobileExtraFiltersOpen);
      elements.mobileFilterToggle.setAttribute('aria-expanded', mobileExtraFiltersOpen ? 'true' : 'false');
      syncFilterViewportState();
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
      cover.innerHTML = `<img src="${escapeHtml(getCoverUrl(game))}" alt="" aria-hidden="true" loading="lazy" />`;

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
      const hasPlatinum = hasCompletedAllAchievements(game);
      card.classList.toggle('is-platinum', hasPlatinum);
      const platinumBadge = node.querySelector<HTMLElement>('[data-platinum]');
      if (platinumBadge) platinumBadge.hidden = !hasPlatinum;
      card.href = `/games/${game.slug}/`;
      card.addEventListener('click', (event) => {
        const usesRevealInteraction = window.matchMedia('(hover: none) and (min-width: 821px)').matches;
        if (usesRevealInteraction && !card.classList.contains('is-open')) {
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
      const row = rowNode.querySelector<HTMLAnchorElement>('[data-row-link]')!;
      row.classList.toggle('is-platinum', hasPlatinum);
      const rowPlatinum = rowNode.querySelector<HTMLElement>('[data-row-platinum]');
      if (rowPlatinum) rowPlatinum.hidden = !hasPlatinum;
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
        game.horas == null
          ? '-'
          : `${game.horas.toLocaleString('es-ES', { maximumFractionDigits: 2, useGrouping: 'always' })} h`;
      (rowNode.querySelector('[data-row-precio]') as HTMLElement).textContent = formatViewPrice(game);
      (rowNode.querySelector('[data-row-lanzamiento]') as HTMLElement).textContent = formatValue(game.lanzamiento);

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
      else if (filter === 'tag') active = normalizeGameTag(elements.tag.value) === normalizeGameTag(value);
      else if (filter === 'modo') active = elements.modo.value === value;
      else if (filter === 'precio') active = elements.precio.value === value;
      else if (filter === 'rentabilidad') active = elements.rentabilidad.value === value;
      item.classList.toggle('is-active', active);
    });

    updateViewMode();
  };

  // ─── Event listeners ───────────────────────────────────────────────────────

  [elements.search, elements.estado, elements.launcher, elements.plataforma, elements.tag, elements.modo, elements.sort, elements.precio, elements.rentabilidad]
    .forEach((el) => { el.addEventListener('input', render); el.addEventListener('change', render); });

  elements.mobileSort?.addEventListener('change', () => {
    elements.sort.value = elements.mobileSort?.value ?? DEFAULT_SORT;
    render();
  });

  elements.tableSortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const sortKey = button.dataset.tableSort;
      if (!sortKey) return;
      const [currentKey, currentDirection] = elements.sort.value.split('-');
      const defaultDirection = button.dataset.defaultDirection === 'asc' ? 'asc' : 'desc';
      const nextDirection = currentKey === sortKey
        ? (currentDirection === 'asc' ? 'desc' : 'asc')
        : defaultDirection;
      elements.sort.value = `${sortKey}-${nextDirection}`;
      if (elements.mobileSort) elements.mobileSort.value = elements.sort.value;
      render();
    });
  });

  const resetFilters = (): void => {
    const restoreFilterToggle = mobileExtraFiltersOpen;
    elements.search.value = '';
    elements.estado.value = '';
    elements.launcher.value = '';
    elements.plataforma.value = '';
    elements.tag.value = '';
    elements.modo.value = '';
    elements.sort.value = DEFAULT_SORT;
    if (elements.mobileSort) elements.mobileSort.value = DEFAULT_SORT;
    elements.precio.value = '';
    elements.rentabilidad.value = '';
    mobileExtraFiltersOpen = false;
    render();
    if (restoreFilterToggle) elements.mobileFilterToggle?.focus();
  };

  elements.reset.addEventListener('click', resetFilters);
  elements.mobileReset?.addEventListener('click', resetFilters);

  elements.activeFilterPills.addEventListener('click', (event) => {
    const pill = (event.target as HTMLElement).closest<HTMLElement>('[data-filter-remove]');
    if (!pill) return;
    const key = pill.dataset.filterRemove!;
    if (key === 'search') elements.search.value = '';
    if (key === 'estado') elements.estado.value = '';
    if (key === 'launcher') elements.launcher.value = '';
    if (key === 'plataforma') elements.plataforma.value = '';
    if (key === 'tag') elements.tag.value = '';
    if (key === 'modo') elements.modo.value = '';
    if (key === 'precio') elements.precio.value = '';
    if (key === 'rentabilidad') elements.rentabilidad.value = '';
    render();
  });

  elements.quickFilters.forEach((chip) => {
    chip.addEventListener('click', () => {
      const nextValue = (chip as HTMLElement).dataset.quickFilter ?? '';
      if (nextValue === '') {
        elements.estado.value = '';
        elements.precio.value = '';
        elements.tag.value = '';
        elements.rentabilidad.value = '';
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
      } else if (TAG_QUICK_FILTERS[nextValue]) {
        const tag = TAG_QUICK_FILTERS[nextValue];
        elements.tag.value = normalizeGameTag(elements.tag.value) === tag ? '' : tag;
      } else if (PROFITABILITY_QUICK_FILTERS[nextValue]) {
        const rentabilidad = PROFITABILITY_QUICK_FILTERS[nextValue];
        elements.rentabilidad.value = elements.rentabilidad.value === rentabilidad ? '' : rentabilidad;
      }
      render();
    });
  });

  elements.mobileFilterToggle?.addEventListener('click', () => {
    mobileExtraFiltersOpen = !mobileExtraFiltersOpen;
    render();
    if (mobileExtraFiltersOpen && usesMobileFilterSheet()) {
      requestAnimationFrame(() => elements.mobileFilterClose?.focus());
    }
  });

  elements.mobileFilterBackdrop?.addEventListener('click', closeMobileFilters);
  elements.mobileFilterClose?.addEventListener('click', closeMobileFilters);
  elements.mobileFilterApply?.addEventListener('click', closeMobileFilters);

  document.addEventListener('keydown', (event) => {
    if (!mobileExtraFiltersOpen || !usesMobileFilterSheet()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileFilters();
      return;
    }
    if (event.key !== 'Tab' || !elements.mobileExtraFilters) return;
    const focusable = Array.from(elements.mobileExtraFilters.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    )).filter((item) => !item.hasAttribute('hidden') && item.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      elements.mobileExtraFilters.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (mobileExtraFiltersOpen && !usesMobileFilterSheet()) {
      mobileExtraFiltersOpen = false;
      render();
      return;
    }
    syncFilterViewportState();
  });

  elements.viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeView = (button as HTMLElement).dataset.view === 'table' ? 'table' : 'cards';
      render();
      document.querySelector('.mock-catalog-controls')?.scrollIntoView({ block: 'start' });
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
      if (filter === 'sort') {
        elements.sort.value = value;
        if (elements.mobileSort) elements.mobileSort.value = value;
      }
      else if (filter === 'estado') elements.estado.value = value;
      else if (filter === 'launcher') elements.launcher.value = value;
      else if (filter === 'plataforma') elements.plataforma.value = value;
      else if (filter === 'tag') elements.tag.value = value;
      else if (filter === 'modo') elements.modo.value = value;
      else if (filter === 'precio') elements.precio.value = value;
      else if (filter === 'rentabilidad') elements.rentabilidad.value = value;
      closeMobileDrawer();
      render();
    });
  });

  // Cerrar card abierta en touch al tocar fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.mock-game-card.is-open').forEach((c) => c.classList.remove('is-open'));
  });

  render();
  if (!window.location.hash) requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
}
