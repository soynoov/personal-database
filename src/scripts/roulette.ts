import { buildGameCoverUrl } from '../lib/game-cover-url';
import { gameHasMode } from '../lib/game-modes';
import { normalizeStatus } from '../lib/game-status';
import { hasGameTag } from '../lib/game-tags';
import type { RouletteGame } from '../lib/roulette-game';
import gamepadIcon from '@tabler/icons/outline/device-gamepad-2.svg?url';

const WHEEL_COLORS = [
  '#a63f45',
  '#243f67',
  '#563866',
  '#17615d',
  '#b98216',
  '#8f343d',
  '#2d5877',
  '#664276',
];

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
const coverUrlCache = new Map<string, string>();
const FILTER_STORAGE_KEY = 'personal-db:roulette-filters:v1';

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontró #${id}`);
  return element as T;
};

const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const gameCoverUrl = (game: RouletteGame): string => {
  const cached = coverUrlCache.get(game.slug);
  if (cached) return cached;
  const url = buildGameCoverUrl(game);
  coverUrlCache.set(game.slug, url);
  return url;
};

const gameHeroUrl = (game: RouletteGame): string =>
  game.steam_appid
    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.steam_appid}/header.jpg`
    : gameCoverUrl(game);

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
};

const fitCanvas = (canvas: HTMLCanvasElement): { context: CanvasRenderingContext2D; size: number } | null => {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const cssSize = Math.max(260, Math.round(canvas.getBoundingClientRect().width || 680));
  const density = Math.min(window.devicePixelRatio || 1, 2);
  const pixelSize = Math.round(cssSize * density);
  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize;
    canvas.height = pixelSize;
  }
  context.setTransform(density, 0, 0, density, 0, 0);
  return { context, size: cssSize };
};

const drawImageCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
) => {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = 1;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }
  context.drawImage(image, sx, sy, sw, sh, 0, 0, size, size);
};

const shortTitle = (title: string, maxLength: number): string => {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, Math.max(3, maxLength - 1)).trim()}…`;
};

const paintWheel = (
  canvas: HTMLCanvasElement,
  games: RouletteGame[],
  images: Array<HTMLImageElement | null> = [],
) => {
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { context, size } = fitted;
  const center = size / 2;
  const radius = center - 10;
  context.clearRect(0, 0, size, size);

  if (games.length === 0) {
    context.beginPath();
    context.arc(center, center, radius - 2, 0, Math.PI * 2);
    context.fillStyle = '#121b29';
    context.fill();
    context.strokeStyle = 'rgba(153, 171, 196, 0.22)';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#8d9aac';
    context.font = `600 ${Math.max(14, size * 0.028)}px "Elms Sans", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Añade al menos 2 juegos', center, center);
    return;
  }

  const arc = (Math.PI * 2) / games.length;
  const startOffset = -Math.PI / 2 - arc / 2;
  const useArtwork = games.length <= 12;

  games.forEach((game, index) => {
    const start = startOffset + index * arc;
    const end = start + arc;
    context.save();
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.clip();

    const image = useArtwork ? images[index] : null;
    if (image) {
      drawImageCover(context, image, size);
      context.fillStyle = 'rgba(5, 9, 16, 0.36)';
      context.fillRect(0, 0, size, size);
    } else {
      context.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
      context.fillRect(0, 0, size, size);
    }
    context.restore();

    context.beginPath();
    context.moveTo(center, center);
    context.lineTo(center + Math.cos(start) * radius, center + Math.sin(start) * radius);
    context.strokeStyle = 'rgba(7, 12, 20, 0.9)';
    context.lineWidth = Math.max(1, size * 0.004);
    context.stroke();

    if (games.length <= 20) {
      const middle = start + arc / 2;
      const labelRadius = radius * (games.length <= 8 ? 0.68 : 0.72);
      context.save();
      context.translate(center, center);
      context.rotate(middle);
      context.fillStyle = '#fff8f4';
      context.shadowColor = 'rgba(0, 0, 0, 0.8)';
      context.shadowBlur = 5;
      context.font = `700 ${Math.max(11, size * (games.length <= 8 ? 0.029 : 0.021))}px "Elms Sans", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const maxLength = games.length <= 8 ? 18 : 12;
      context.fillText(shortTitle(game.titulo, maxLength), labelRadius, 0);
      context.restore();
    }
  });

  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.strokeStyle = '#26354a';
  context.lineWidth = Math.max(5, size * 0.012);
  context.stroke();

  context.beginPath();
  context.arc(center, center, radius * 0.155, 0, Math.PI * 2);
  context.fillStyle = '#121c2a';
  context.fill();
  context.strokeStyle = '#35455c';
  context.lineWidth = Math.max(2, size * 0.006);
  context.stroke();
  context.fillStyle = '#f06262';
  context.font = `700 ${Math.max(14, size * 0.038)}px "Elms Sans", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(games.length), center, center);
};

const drawWheel = async (canvas: HTMLCanvasElement, games: RouletteGame[], token: number) => {
  paintWheel(canvas, games);
  if (games.length === 0 || games.length > 12) return;
  const images = await Promise.all(games.map((game) => loadImage(gameCoverUrl(game))));
  if (Number(canvas.dataset.drawToken) !== token) return;
  paintWheel(canvas, games, images);
};

const secureRandomIndex = (length: number): number => {
  const range = 0x1_0000_0000;
  const limit = Math.floor(range / length) * length;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % length;
};

const formatHltb = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'HLTB sin dato';
  const hours = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(Number(value));
  return `HLTB ${hours} h`;
};

export function initRoulette(games: RouletteGame[], defaultSlugs: string[]) {
  const page = document.querySelector<HTMLElement>('.roulette-page');
  const setup = getElement<HTMLElement>('roulette-setup');
  const result = getElement<HTMLElement>('roulette-result');
  const wheel = getElement<HTMLCanvasElement>('roulette-wheel');
  const resultWheel = getElement<HTMLCanvasElement>('roulette-result-wheel');
  const spinButton = getElement<HTMLButtonElement>('roulette-spin');
  const clearButton = getElement<HTMLButtonElement>('roulette-clear');
  const addButton = getElement<HTMLButtonElement>('roulette-add');
  const searchInput = getElement<HTMLInputElement>('roulette-search');
  const statusSelect = getElement<HTMLSelectElement>('roulette-status');
  const modeSelect = getElement<HTMLSelectElement>('roulette-mode');
  const tagSelect = getElement<HTMLSelectElement>('roulette-tag');
  const genreSelect = getElement<HTMLSelectElement>('roulette-genre');
  const platformSelect = getElement<HTMLSelectElement>('roulette-platform');
  const launcherSelect = getElement<HTMLSelectElement>('roulette-launcher');
  const selectAll = getElement<HTMLInputElement>('roulette-select-all');
  const candidateList = getElement<HTMLElement>('roulette-candidates');
  const count = getElement<HTMLElement>('roulette-count');
  const feedback = getElement<HTMLElement>('roulette-feedback');
  const againButton = getElement<HTMLButtonElement>('roulette-again');
  const excludeButton = getElement<HTMLButtonElement>('roulette-exclude');

  const bySlug = new Map(games.map((game) => [game.slug, game]));
  const byTitle = new Map(games.map((game) => [normalizeText(game.titulo), game]));
  const defaultPool = defaultSlugs.filter((slug) => bySlug.has(slug));
  let pool = new Set(defaultPool);
  let excluded = new Set<string>();
  let drawToken = 0;
  let currentRotation = 0;
  let spinning = false;
  let lastWinner: RouletteGame | null = null;
  let lastParticipants: RouletteGame[] = [];
  const filterSelects = {
    status: statusSelect,
    mode: modeSelect,
    tag: tagSelect,
    genre: genreSelect,
    platform: platformSelect,
    launcher: launcherSelect,
  };

  const persistFilters = () => {
    const values = Object.fromEntries(
      Object.entries(filterSelects).map(([key, select]) => [key, select.value]),
    );
    if (Object.values(values).every((value) => value === '')) {
      localStorage.removeItem(FILTER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(values));
  };

  const restoreFilters = () => {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return;
    try {
      const values = JSON.parse(raw) as Record<string, unknown>;
      Object.entries(filterSelects).forEach(([key, select]) => {
        const candidate = typeof values[key] === 'string' ? String(values[key]) : '';
        const isValid = Array.from(select.options).some((option) => option.value === candidate);
        if (isValid) select.value = candidate;
      });
    } catch {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    }
  };

  const poolGames = (): RouletteGame[] =>
    [...pool]
      .map((slug) => bySlug.get(slug))
      .filter((game): game is RouletteGame => Boolean(game));

  const activeGames = (): RouletteGame[] => poolGames().filter((game) => !excluded.has(game.slug));

  const refreshWheel = () => {
    const active = activeGames();
    drawToken += 1;
    wheel.dataset.drawToken = String(drawToken);
    resultWheel.dataset.drawToken = String(drawToken);
    void drawWheel(wheel, active, drawToken);
    wheel.setAttribute(
      'aria-label',
      active.length > 0
        ? `Ruleta con ${active.length} juegos: ${active.map((game) => game.titulo).join(', ')}`
        : 'Ruleta vacía',
    );
    count.textContent = `${active.length} candidato${active.length === 1 ? '' : 's'}`;
    spinButton.disabled = active.length < 2 || spinning;
    selectAll.checked = pool.size > 0 && excluded.size === 0;
    selectAll.indeterminate = excluded.size > 0 && excluded.size < pool.size;
  };

  const createCandidateRow = (game: RouletteGame): HTMLElement => {
    const row = document.createElement('label');
    row.className = 'roulette-candidate';

    const marker = document.createElement('span');
    marker.className = 'roulette-candidate-marker';
    marker.style.setProperty('--candidate-color', WHEEL_COLORS[poolGames().indexOf(game) % WHEEL_COLORS.length]);

    const image = document.createElement('img');
    image.src = gameCoverUrl(game);
    image.alt = '';
    image.loading = 'lazy';

    const copy = document.createElement('span');
    copy.className = 'roulette-candidate-copy';
    const title = document.createElement('strong');
    title.textContent = game.titulo;
    const meta = document.createElement('small');
    meta.textContent = [game.estado, game.generos?.slice(0, 2).join(' · ')].filter(Boolean).join(' · ');
    copy.append(title, meta);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !excluded.has(game.slug);
    checkbox.setAttribute('aria-label', `Incluir ${game.titulo}`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) excluded.delete(game.slug);
      else excluded.add(game.slug);
      feedback.textContent = '';
      refreshWheel();
    });

    row.append(marker, image, copy, checkbox);
    return row;
  };

  const renderCandidates = () => {
    candidateList.replaceChildren();
    const candidates = poolGames();
    if (candidates.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'roulette-empty';
      const emptyIcon = document.createElement('span');
      emptyIcon.className = 'tabler-icon';
      emptyIcon.style.setProperty('--tabler-icon', `url("${gamepadIcon}")`);
      emptyIcon.setAttribute('aria-hidden', 'true');
      const emptyTitle = document.createElement('strong');
      emptyTitle.textContent = 'Sin candidatos';
      const emptyCopy = document.createElement('span');
      emptyCopy.textContent = 'Usa los filtros o añade un juego por nombre.';
      empty.append(emptyIcon, emptyTitle, emptyCopy);
      candidateList.append(empty);
    } else {
      const fragment = document.createDocumentFragment();
      candidates.forEach((game) => fragment.append(createCandidateRow(game)));
      candidateList.append(fragment);
    }
    refreshWheel();
  };

  const addGameByName = () => {
    const game = byTitle.get(normalizeText(searchInput.value));
    if (!game) {
      feedback.textContent = searchInput.value.trim()
        ? 'Ese título no existe en la base de datos.'
        : 'Escribe el nombre de un juego de tu biblioteca.';
      searchInput.focus();
      return;
    }
    pool.add(game.slug);
    excluded.delete(game.slug);
    searchInput.value = '';
    feedback.textContent = `${game.titulo} añadido a la ruleta.`;
    renderCandidates();
  };

  const applyFilters = () => {
    const status = normalizeStatus(statusSelect.value);
    const mode = modeSelect.value;
    const tag = tagSelect.value;
    const genre = normalizeText(genreSelect.value);
    const platform = normalizeText(platformSelect.value);
    const launcher = normalizeText(launcherSelect.value);
    const hasFilters = Boolean(status || mode || tag || genre || platform || launcher);

    const matches = games.filter((game) =>
      (!status || normalizeStatus(game.estado) === status) &&
      (!mode || gameHasMode(game, mode)) &&
      (!tag || hasGameTag(game.tags, tag)) &&
      (!genre || game.generos?.some((item) => normalizeText(item) === genre)) &&
      (!platform || normalizeText(game.plataforma) === platform) &&
      (!launcher || normalizeText(game.launcher) === launcher),
    );

    pool = new Set(matches.map((game) => game.slug));
    excluded = new Set();
    feedback.textContent = hasFilters
      ? `${matches.length} juego${matches.length === 1 ? '' : 's'} coincide${matches.length === 1 ? '' : 'n'} con los filtros.`
      : 'Todos los juegos de la biblioteca están disponibles.';
    renderCandidates();
  };

  const populateParticipants = (participants: RouletteGame[]) => {
    const strip = getElement<HTMLElement>('roulette-participant-strip');
    strip.replaceChildren();
    participants.slice(0, 10).forEach((game) => {
      const link = document.createElement('a');
      link.href = `/games/${game.slug}/`;
      link.className = 'roulette-participant';
      link.title = game.titulo;
      const image = document.createElement('img');
      image.src = gameCoverUrl(game);
      image.alt = game.titulo;
      image.loading = 'eager';
      link.append(image);
      strip.append(link);
    });
    getElement<HTMLElement>('roulette-participants-count').textContent =
      `Participaron ${participants.length} juego${participants.length === 1 ? '' : 's'}`;
  };

  const showResult = (winner: RouletteGame, participants: RouletteGame[]) => {
    lastWinner = winner;
    lastParticipants = participants;
    const winnerCover = getElement<HTMLImageElement>('roulette-winner-cover');
    winnerCover.onerror = () => {
      winnerCover.onerror = null;
      winnerCover.src = gameCoverUrl(winner);
    };
    winnerCover.src = gameHeroUrl(winner);
    winnerCover.alt = `Portada de ${winner.titulo}`;
    getElement<HTMLElement>('roulette-winner-title').textContent = winner.titulo;
    const status = getElement<HTMLElement>('roulette-winner-status');
    status.textContent = winner.estado || 'Sin estado';
    status.dataset.status = normalizeStatus(winner.estado);
    getElement<HTMLElement>('roulette-winner-genres').textContent = winner.generos?.slice(0, 3).join(' · ') || 'Sin género';
    getElement<HTMLElement>('roulette-winner-launcher').textContent = winner.launcher || 'Sin launcher';
    getElement<HTMLElement>('roulette-winner-hltb').textContent = formatHltb(winner.hltb);
    const winnerLink = getElement<HTMLAnchorElement>('roulette-winner-link');
    winnerLink.href = `/games/${winner.slug}/`;
    populateParticipants(participants);

    resultWheel.dataset.drawToken = String(drawToken);
    void drawWheel(resultWheel, participants, drawToken);
    setup.hidden = true;
    result.hidden = false;
    page?.classList.add('is-result');
    result.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const spin = () => {
    const participants = activeGames();
    if (participants.length < 2 || spinning) {
      feedback.textContent = 'Necesitas al menos 2 juegos seleccionados.';
      return;
    }

    spinning = true;
    feedback.textContent = 'Girando…';
    spinButton.disabled = true;
    const winnerIndex = secureRandomIndex(participants.length);
    const winner = participants[winnerIndex];
    const sliceDegrees = 360 / participants.length;
    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const desired = ((-winnerIndex * sliceDegrees - normalizedRotation) % 360 + 360) % 360;
    currentRotation += 6 * 360 + desired;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    wheel.style.transition = reducedMotion ? 'none' : 'transform 4.4s cubic-bezier(0.12, 0.72, 0.12, 1)';
    requestAnimationFrame(() => {
      wheel.style.transform = `rotate(${currentRotation}deg)`;
    });

    const finish = () => {
      spinning = false;
      feedback.textContent = `${winner.titulo} ha sido el elegido.`;
      showResult(winner, participants);
    };
    if (reducedMotion) window.setTimeout(finish, 80);
    else wheel.addEventListener('transitionend', finish, { once: true });
  };

  [statusSelect, modeSelect, tagSelect, genreSelect, platformSelect, launcherSelect].forEach((select) => {
    select.addEventListener('change', () => {
      persistFilters();
      applyFilters();
    });
  });
  addButton.addEventListener('click', addGameByName);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addGameByName();
  });
  clearButton.addEventListener('click', () => {
    pool.clear();
    excluded.clear();
    statusSelect.value = '';
    modeSelect.value = '';
    tagSelect.value = '';
    genreSelect.value = '';
    platformSelect.value = '';
    launcherSelect.value = '';
    persistFilters();
    searchInput.value = '';
    feedback.textContent = 'La ruleta está vacía.';
    renderCandidates();
  });
  selectAll.addEventListener('change', () => {
    excluded = selectAll.checked ? new Set() : new Set(pool);
    renderCandidates();
  });
  spinButton.addEventListener('click', spin);
  againButton.addEventListener('click', () => {
    page?.classList.remove('is-result');
    result.hidden = true;
    setup.hidden = false;
    feedback.textContent = lastWinner ? `${lastWinner.titulo} sigue participando.` : '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  excludeButton.addEventListener('click', () => {
    if (!lastWinner) return;
    page?.classList.remove('is-result');
    excluded.add(lastWinner.slug);
    result.hidden = true;
    setup.hidden = false;
    renderCandidates();
    feedback.textContent = `${lastWinner.titulo} excluido de esta tirada.`;
    if (activeGames().length >= 2) window.setTimeout(spin, 240);
  });

  const resizeObserver = new ResizeObserver(() => {
    refreshWheel();
    if (!result.hidden && lastParticipants.length > 0) {
      resultWheel.dataset.drawToken = String(drawToken);
      void drawWheel(resultWheel, lastParticipants, drawToken);
    }
  });
  resizeObserver.observe(wheel);
  resizeObserver.observe(resultWheel);

  restoreFilters();
  applyFilters();
}
