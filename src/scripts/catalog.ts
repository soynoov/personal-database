/**
 * catalog.ts
 * Lógica cliente del catálogo: filtrado, renderizado de cards/tabla,
 * navegación y handlers de eventos.
 *
 * Punto de entrada: initCatalog(games)
 * Los datos llegan serializados desde index.astro via atributo data-games.
 */

import { createGamePill, updateGamePill } from './game-pill';
import { buildGameCoverUrl } from "../lib/game-cover-url";
import { getGoldenCompletionKind, matchesGoldenFilter } from "../lib/game-achievements";
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
    golden: el<HTMLSelectElement>('#golden'),
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
    '.page-header',
    '.app-header',
    '.desktop-sidebar',
    '#cards-shell',
    '#table-shell',
    '.catalog-filters-top',
    '#active-filter-pills',
    '.panel-subtoolbar',
    '.legend-app',
    '.mobile-bottom-nav',
  ].join(',')));
  const previousAriaHidden = new Map<HTMLElement, string | null>();
  let modalIsolationActive = false;

  // Restaurar params de URL
  const params = new URLSearchParams(window.location.search);
  for (const key of ['search', 'estado', 'launcher', 'plataforma', 'tag', 'modo', 'sort', 'precio', 'rentabilidad', 'golden']) {
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
      return filters.estado === '' && filters.precio === '' && filters.tag === '' && filters.rentabilidad === '' && filters.golden === '';
    }
    if (chipValue === 'golden') return filters.golden === 'true';
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

  let renderedSearchValue = elements.search.value;
  const render = (): void => {
    renderedSearchValue = elements.search.value;
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
      golden: elements.golden.value,
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
          matchesModeFilter(game, filters.modo) &&
          matchesGoldenFilter(game, filters.golden)
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
      jugando: 'var(--status-playing-fg)', terminado: 'var(--status-completed-fg)', completado: 'var(--status-completed-fg)',
      pendiente: 'var(--status-pending-fg)', wishlist: 'var(--status-wishlist-fg)', pausado: 'var(--danger)',
      abandonado: 'var(--danger)', retirado: 'var(--muted)', recurrente: 'var(--status-recurring-fg)',
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
          dot.style.background = estadoPillColors[normalizeStatus(value)] ?? 'var(--muted)';
          dot.setAttribute('aria-hidden', 'true');
          button.appendChild(dot);
        } else if (key === 'tag') {
          label = `Etiqueta: ${getGameTagLabel(value)}`;
        } else if (key === 'modo') {
          label = `Modo: ${getGameModeLabel(value)}`;
        } else if (key === 'golden') {
          label = 'Golden Card';
        } else if (key === 'rentabilidad') {
          const profitabilityLabels: Record<string, string> = {
            amortized: 'Amortizados',
            unamortized: 'No amortizados',
            incomplete: 'Datos incompletos',
          };
          label = `Rentabilidad: ${profitabilityLabels[String(value)] ?? value}`;
        } else {
          const labels: Record<string, string> = { search: 'Búsqueda', launcher: 'Launcher', plataforma: 'Plataforma', precio: 'Precio' };
          label = `${labels[key] ?? key}: ${value}`;
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

    // Renderizar únicamente la vista activa. La otra se crea bajo demanda al
    // cambiar de vista, evitando duplicar todo el catálogo en el DOM.
    const activeContainer = activeView === 'table' ? elements.tableBody : elements.cards;
    const inactiveContainer = activeView === 'table' ? elements.cards : elements.tableBody;
    const fragment = document.createDocumentFragment();
    inactiveContainer.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.getElementById('catalog-empty-template') as HTMLTemplateElement;
      activeContainer.replaceChildren(empty.content.cloneNode(true));
      updateViewMode();
      return;
    }

    for (const game of filtered) {
      const goldenCompletionKind = getGoldenCompletionKind(game);
      const hasPlatinum = goldenCompletionKind !== null;
      const goldenAriaLabel = goldenCompletionKind === 'game'
        ? 'Juego completado al 100%'
        : '100% de logros completados';

      if (activeView === 'cards') {
        const node = elements.template.content.cloneNode(true) as DocumentFragment;
        node.querySelector('[data-title]')!.textContent = formatValue(game.titulo);

        const kickerPlatform = formatValue(game.plataforma, '');
        const kickerLauncher = formatValue(game.launcher, '');
        const platformBadgesEl = node.querySelector('[data-platform-badges]')!;

        if (kickerPlatform) platformBadgesEl.appendChild(createGamePill('platform', game.plataforma));
        if (kickerLauncher) platformBadgesEl.appendChild(createGamePill('launcher', game.launcher));

        const supportParts: string[] = [];
        if (game.lanzamiento != null && game.lanzamiento !== '')
          supportParts.push(`<span>${escapeHtml(String(game.lanzamiento))}</span>`);
        if (Array.isArray(game.generos) && game.generos.length > 0)
          supportParts.push(`<span>${escapeHtml(game.generos.slice(0, 2).join(', '))}</span>`);
        node.querySelector('[data-support]')!.innerHTML =
          supportParts.join('<span class="support-separator" aria-hidden="true"> | </span>') || 'Sin contexto';

        const cover = node.querySelector('[data-cover]')!;
        cover.innerHTML = `<img src="${escapeHtml(getCoverUrl(game))}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`;

        const statusBadge = node.querySelector('[data-estado]') as HTMLElement;
        updateGamePill(statusBadge, 'status', game.estado);
        if (hasFreeToPlayTag(game)) node.querySelector('.badges')!.appendChild(createGamePill('tag', 'free-to-play'));
        if (hasEarlyAccess(game)) node.querySelector('.badges')!.appendChild(createGamePill('tag', 'early-access'));

        (node.querySelector('[data-horas]') as HTMLElement).textContent =
          game.horas == null
            ? '-'
            : `${game.horas_estimadas ? '≈' : ''}${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1, useGrouping: true }).format(Number(game.horas))}`;

        const card = node.querySelector<HTMLAnchorElement>('[data-game-link]')!;
        card.classList.toggle('is-platinum', hasPlatinum);
        const platinumBadge = node.querySelector<HTMLElement>('[data-platinum]');
        if (platinumBadge) {
          platinumBadge.hidden = !hasPlatinum;
          platinumBadge.setAttribute('aria-label', goldenAriaLabel);
        }
        card.href = `/games/${game.slug}/`;
        fragment.appendChild(node);
        continue;
      }

      const rowNode = elements.tableTemplate.content.cloneNode(true) as DocumentFragment;
      (rowNode.querySelector('[data-row-title]') as HTMLElement).textContent = formatValue(game.titulo);
      const row = rowNode.querySelector<HTMLAnchorElement>('[data-row-link]')!;
      row.classList.toggle('is-platinum', hasPlatinum);
      const rowPlatinum = rowNode.querySelector<HTMLElement>('[data-row-platinum]');
      if (rowPlatinum) {
        rowPlatinum.hidden = !hasPlatinum;
        rowPlatinum.setAttribute('aria-label', goldenAriaLabel);
      }
      (rowNode.querySelector('[data-row-support]') as HTMLElement).textContent =
        Array.isArray(game.generos) && game.generos.length > 0 ? String(game.generos[0]) : 'Sin genero';

      const rowCover = rowNode.querySelector('[data-row-cover]')!;
      rowCover.innerHTML = `<img src="${escapeHtml(getCoverUrl(game))}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`;

      const rowStatus = rowNode.querySelector('[data-row-estado]') as HTMLElement;
      updateGamePill(rowStatus, 'status', game.estado);
      updateGamePill(rowNode.querySelector('[data-row-launcher]') as HTMLElement, 'launcher', game.launcher, formatValue(game.launcher, 'Sin launcher'));
      updateGamePill(rowNode.querySelector('[data-row-plataforma]') as HTMLElement, 'platform', game.plataforma);

      (rowNode.querySelector('[data-row-horas]') as HTMLElement).textContent =
        game.horas == null
          ? '-'
          : `${game.horas_estimadas ? '≈' : ''}${game.horas.toLocaleString('es-ES', { maximumFractionDigits: 2, useGrouping: 'always' })} h`;
      (rowNode.querySelector('[data-row-precio]') as HTMLElement).textContent = formatViewPrice(game);
      (rowNode.querySelector('[data-row-lanzamiento]') as HTMLElement).textContent = formatValue(game.lanzamiento);

      row.href = `/games/${game.slug}/`;
      fragment.appendChild(rowNode);
    }

    activeContainer.replaceChildren(fragment);


    updateViewMode();
  };

  // ─── Event listeners ───────────────────────────────────────────────────────

  let searchRenderTimer: number | undefined;
  elements.search.addEventListener('input', () => {
    window.clearTimeout(searchRenderTimer);
    searchRenderTimer = window.setTimeout(render, 140);
  });
  elements.search.addEventListener('change', () => {
    window.clearTimeout(searchRenderTimer);
    if (elements.search.value !== renderedSearchValue) render();
  });

  [elements.estado, elements.launcher, elements.plataforma, elements.tag, elements.modo, elements.sort, elements.precio, elements.rentabilidad, elements.golden]
    .forEach((control) => control.addEventListener('change', render));

  elements.cards.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const card = target?.closest<HTMLAnchorElement>('[data-game-link]');
    if (!card) return;
    const usesRevealInteraction = window.matchMedia('(hover: none) and (min-width: 821px)').matches;
    if (usesRevealInteraction && !card.classList.contains('is-open')) {
      event.preventDefault();
      elements.cards.querySelectorAll('.mock-game-card.is-open').forEach((item) => item.classList.remove('is-open'));
      card.classList.add('is-open');
      event.stopPropagation();
    }
  });

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
    elements.golden.value = '';
    mobileExtraFiltersOpen = false;
    render();
    if (restoreFilterToggle) elements.mobileFilterToggle?.focus();
  };

  elements.reset.addEventListener('click', resetFilters);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('[data-empty-reset="catalog"]')) {
      resetFilters();
      elements.search.focus();
    }
  });
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
    if (key === 'golden') elements.golden.value = '';
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
        elements.golden.value = '';
      } else if (nextValue === 'golden') {
        elements.golden.value = elements.golden.value === 'true' ? '' : 'true';
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

  // Cerrar card abierta en touch al tocar fuera
  document.addEventListener('click', () => {
    document.querySelectorAll('.mock-game-card.is-open').forEach((c) => c.classList.remove('is-open'));
  });

  render();
  if (!window.location.hash && document.activeElement !== elements.search) requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
}
