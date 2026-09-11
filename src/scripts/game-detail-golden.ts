const MOTION_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const PROPERTIES = ['--golden-x', '--golden-y', '--foil-field-x', '--foil-field-y', '--foil-angle'];

export function initGameDetailGolden(): void {
  const surface = document.querySelector<HTMLElement>('[data-golden-atmosphere]');
  if (!surface || surface.dataset.initialized === 'true') return;
  surface.dataset.initialized = 'true';

  const motion = window.matchMedia(MOTION_QUERY);
  const listeners = new AbortController();
  let frame: number | null = null;
  let pointer: { x: number; y: number } | null = null;

  const reset = (): void => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    pointer = null;
    surface.classList.remove('is-lit');
    for (const property of PROPERTIES) surface.style.removeProperty(property);
  };

  const update = (event: PointerEvent): void => {
    if (!motion.matches || event.pointerType === 'touch' || document.hidden || document.querySelector('dialog[open]')) {
      reset();
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      if (!pointer || !motion.matches) return;
      // Pixel position follows the pointer; optical texture size is independent of ultrawide width.
      const x = Math.max(-1, Math.min(1, pointer.x / Math.max(1, window.innerWidth) * 2 - 1));
      const y = Math.max(-1, Math.min(1, pointer.y / Math.max(1, window.innerHeight) * 2 - 1));
      surface.style.setProperty('--golden-x', `${pointer.x}px`);
      surface.style.setProperty('--golden-y', `${pointer.y}px`);
      surface.style.setProperty('--foil-field-x', `${50 + x * 24 + y * 10}%`);
      surface.style.setProperty('--foil-field-y', `${50 + y * 22 - x * 8}%`);
      surface.style.setProperty('--foil-angle', `${130 + x * 6 - y * 4}deg`);
      surface.classList.add('is-lit');
    });
  };

  window.addEventListener('pointermove', update, { passive: true, signal: listeners.signal });
  document.documentElement.addEventListener('pointerleave', reset, { signal: listeners.signal });
  window.addEventListener('pointercancel', reset, { signal: listeners.signal });
  window.addEventListener('blur', reset, { signal: listeners.signal });
  window.addEventListener('resize', reset, { signal: listeners.signal });
  document.addEventListener('visibilitychange', reset, { signal: listeners.signal });
  document.addEventListener('focusin', reset, { signal: listeners.signal });
  document.addEventListener('toggle', (event) => {
    if (event.target instanceof HTMLDialogElement && event.target.open) reset();
  }, { capture: true, signal: listeners.signal });
  motion.addEventListener('change', reset, { signal: listeners.signal });
  window.addEventListener('pagehide', (event) => {
    reset();
    // A bfcache restore keeps this same document and its listeners alive.
    if (!event.persisted) listeners.abort();
  });
}
