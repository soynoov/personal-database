const CARD_SELECTOR = '.mock-game-card';
const MAX_TILT_DEGREES = 7;
const OPTICAL_PROPERTIES = [
  '--pointer-x',
  '--pointer-y',
  '--card-tilt-x',
  '--card-tilt-y',
  '--card-shadow-x',
  '--card-shadow-y',
  '--card-glow-x',
  '--card-glow-y',
  '--foil-light-x',
  '--foil-light-y',
  '--foil-field-x',
  '--foil-field-y',
  '--foil-angle',
] as const;

type PendingTilt = {
  card: HTMLElement;
  clientX: number;
  clientY: number;
};

const clamp = (value: number): number => Math.min(1, Math.max(-1, value));

export function initCardTilt(container: HTMLElement | null): void {
  if (!container) return;

  const tiltEnabled = window.matchMedia(
    '(min-width: 821px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  let activeCard: HTMLElement | null = null;
  let activeBounds: DOMRect | null = null;
  let pendingTilt: PendingTilt | null = null;
  let animationFrame: number | null = null;

  const resetCard = (card: HTMLElement): void => {
    card.classList.remove('is-tracking');
    for (const property of OPTICAL_PROPERTIES) card.style.removeProperty(property);
  };

  const resetActiveCard = (): void => {
    pendingTilt = null;
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (activeCard) resetCard(activeCard);
    activeCard = null;
    activeBounds = null;
  };

  const activateCard = (card: HTMLElement): void => {
    if (activeCard === card) return;
    if (activeCard) resetCard(activeCard);
    activeCard = card;
    // Freeze a layout-sized plane on entry, so the enlarged/tilted bounds never
    // feed back into the pointer calculation while moving over the same card.
    const rect = card.getBoundingClientRect();
    activeBounds = new DOMRect(
      rect.left + (rect.width - card.offsetWidth) / 2,
      rect.top + (rect.height - card.offsetHeight) / 2,
      card.offsetWidth,
      card.offsetHeight,
    );
    card.classList.add('is-tracking');
  };

  const updateTilt = (card: HTMLElement, clientX: number, clientY: number): void => {
    pendingTilt = { card, clientX, clientY };
    if (animationFrame !== null) return;

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = null;
      const nextTilt = pendingTilt;
      pendingTilt = null;
      if (!nextTilt || !nextTilt.card.isConnected || !tiltEnabled.matches) return;

      const bounds = activeCard === nextTilt.card ? activeBounds : null;
      if (!bounds) return;
      if (bounds.width === 0 || bounds.height === 0) return;

      const pointerX = clamp(((nextTilt.clientX - bounds.left) / bounds.width) * 2 - 1);
      const pointerY = clamp(((nextTilt.clientY - bounds.top) / bounds.height) * 2 - 1);

      const opticalValues: Record<(typeof OPTICAL_PROPERTIES)[number], string> = {
        '--pointer-x': pointerX.toFixed(4),
        '--pointer-y': pointerY.toFixed(4),
        '--card-tilt-x': `${(-pointerY * MAX_TILT_DEGREES).toFixed(2)}deg`,
        '--card-tilt-y': `${(pointerX * MAX_TILT_DEGREES).toFixed(2)}deg`,
        '--card-shadow-x': `${(-pointerX * 12).toFixed(2)}px`,
        '--card-shadow-y': `${(-pointerY * 7).toFixed(2)}px`,
        '--card-glow-x': `${(pointerX * 10).toFixed(2)}px`,
        '--card-glow-y': `${(pointerY * 10).toFixed(2)}px`,
        '--foil-light-x': `${(50 + pointerX * 38).toFixed(2)}%`,
        '--foil-light-y': `${(50 + pointerY * 38).toFixed(2)}%`,
        '--foil-field-x': `${(50 + pointerX * 24 + pointerY * 10).toFixed(2)}%`,
        '--foil-field-y': `${(50 + pointerY * 22 - pointerX * 8).toFixed(2)}%`,
        '--foil-angle': `${(130 + pointerX * 6 - pointerY * 4).toFixed(2)}deg`,
      };

      for (const [property, value] of Object.entries(opticalValues)) {
        nextTilt.card.style.setProperty(property, value);
      }
    });
  };

  container.addEventListener('pointermove', (event) => {
    if (!tiltEnabled.matches || event.pointerType === 'touch' || !(event.target instanceof Element)) {
      resetActiveCard();
      return;
    }

    const card = event.target.closest<HTMLElement>(CARD_SELECTOR);
    if (!card || !container.contains(card)) {
      resetActiveCard();
      return;
    }

    activateCard(card);
    updateTilt(card, event.clientX, event.clientY);
  });

  container.addEventListener('pointerout', (event) => {
    if (!(event.target instanceof Element)) return;

    const card = event.target.closest<HTMLElement>(CARD_SELECTOR);
    if (!card || card !== activeCard) return;
    if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
    resetActiveCard();
  });

  container.addEventListener('pointercancel', resetActiveCard);
  window.addEventListener('blur', resetActiveCard);
  window.addEventListener('resize', resetActiveCard);
  window.addEventListener('scroll', resetActiveCard, { passive: true });
  tiltEnabled.addEventListener('change', () => {
    if (!tiltEnabled.matches) resetActiveCard();
  });
}
