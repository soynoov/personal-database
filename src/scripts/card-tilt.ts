const CARD_SELECTOR = '.mock-game-card';
const MAX_TILT_DEGREES = 2.4;

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
  let pendingTilt: PendingTilt | null = null;
  let animationFrame: number | null = null;

  const resetCard = (card: HTMLElement): void => {
    card.style.removeProperty('--card-tilt-x');
    card.style.removeProperty('--card-tilt-y');
  };

  const resetActiveCard = (): void => {
    pendingTilt = null;
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (activeCard) resetCard(activeCard);
    activeCard = null;
  };

  const updateTilt = (card: HTMLElement, clientX: number, clientY: number): void => {
    pendingTilt = { card, clientX, clientY };
    if (animationFrame !== null) return;

    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = null;
      const nextTilt = pendingTilt;
      pendingTilt = null;
      if (!nextTilt || !nextTilt.card.isConnected || !tiltEnabled.matches) return;

      const bounds = nextTilt.card.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const pointerX = clamp(((nextTilt.clientX - bounds.left) / bounds.width) * 2 - 1);
      const pointerY = clamp(((nextTilt.clientY - bounds.top) / bounds.height) * 2 - 1);

      nextTilt.card.style.setProperty(
        '--card-tilt-x',
        `${(-pointerY * MAX_TILT_DEGREES).toFixed(2)}deg`,
      );
      nextTilt.card.style.setProperty(
        '--card-tilt-y',
        `${(pointerX * MAX_TILT_DEGREES).toFixed(2)}deg`,
      );
    });
  };

  container.addEventListener('pointermove', (event) => {
    if (!tiltEnabled.matches || !(event.target instanceof Element)) {
      resetActiveCard();
      return;
    }

    const card = event.target.closest<HTMLElement>(CARD_SELECTOR);
    if (!card || !container.contains(card)) {
      resetActiveCard();
      return;
    }

    if (activeCard !== card) {
      if (activeCard) resetCard(activeCard);
      activeCard = card;
    }
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
  tiltEnabled.addEventListener('change', () => {
    if (!tiltEnabled.matches) resetActiveCard();
  });
}
