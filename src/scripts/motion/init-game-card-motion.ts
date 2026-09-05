import { gsap } from 'gsap';
import { motionPresets } from './presets';

type ActiveMotion = {
  card: HTMLElement;
  rect: DOMRect;
  rotateX: (value: number) => void;
  rotateY: (value: number) => void;
  foilX?: (value: number) => void;
  foilY?: (value: number) => void;
};

export function initGameCardMotion(): () => void {
  const grid = document.querySelector<HTMLElement>('#cards');
  if (!grid || grid.dataset.motionReady === 'true') return () => undefined;
  grid.dataset.motionReady = 'true';

  const media = gsap.matchMedia();
  let active: ActiveMotion | null = null;

  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const context = gsap.context(() => {
      const resetActive = () => {
        if (!active) return;
        const { card } = active;
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          y: 0,
          duration: motionPresets.cardTilt.resetDuration,
          ease: motionPresets.cardTilt.ease,
          overwrite: true,
        });
        if (card.classList.contains('is-golden')) {
          gsap.to(card, {
            '--game-card-pointer-x': 50,
            '--game-card-pointer-y': 50,
            '--game-card-foil-opacity': 0,
            duration: motionPresets.goldenFoil.resetDuration,
            ease: motionPresets.goldenFoil.ease,
            overwrite: 'auto',
          });
        }
        active = null;
      };

      const activate = (card: HTMLElement) => {
        if (active?.card === card) return active;
        resetActive();
        const isGolden = card.classList.contains('is-golden');
        active = {
          card,
          rect: card.getBoundingClientRect(),
          rotateX: gsap.quickTo(card, 'rotationX', {
            duration: motionPresets.cardTilt.followDuration,
            ease: motionPresets.cardTilt.ease,
          }),
          rotateY: gsap.quickTo(card, 'rotationY', {
            duration: motionPresets.cardTilt.followDuration,
            ease: motionPresets.cardTilt.ease,
          }),
          foilX: isGolden
            ? gsap.quickTo(card, '--game-card-pointer-x', {
                duration: motionPresets.goldenFoil.followDuration,
                ease: motionPresets.goldenFoil.ease,
              })
            : undefined,
          foilY: isGolden
            ? gsap.quickTo(card, '--game-card-pointer-y', {
                duration: motionPresets.goldenFoil.followDuration,
                ease: motionPresets.goldenFoil.ease,
              })
            : undefined,
        };
        gsap.to(card, {
          y: -4,
          '--game-card-foil-opacity': isGolden ? motionPresets.goldenFoil.opacity : 0,
          duration: 0.2,
          ease: motionPresets.cardTilt.ease,
          overwrite: 'auto',
        });
        return active;
      };

      const onPointerMove = (event: PointerEvent) => {
        const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-game-card]') : null;
        if (!target || !grid.contains(target)) {
          resetActive();
          return;
        }
        const current = activate(target);
        if (!current) return;
        const x = Math.min(1, Math.max(0, (event.clientX - current.rect.left) / current.rect.width));
        const y = Math.min(1, Math.max(0, (event.clientY - current.rect.top) / current.rect.height));
        current.rotateY((x - 0.5) * motionPresets.cardTilt.maxDegrees * 2);
        current.rotateX((0.5 - y) * motionPresets.cardTilt.maxDegrees * 2);
        current.foilX?.(x * 100);
        current.foilY?.(y * 100);
      };

      const onPointerOut = (event: PointerEvent) => {
        if (!active) return;
        const next = event.relatedTarget;
        if (next instanceof Node && active.card.contains(next)) return;
        if (!(next instanceof Element) || !next.closest('[data-game-card]')) resetActive();
      };

      const invalidateRect = () => {
        if (active) active.rect = active.card.getBoundingClientRect();
      };

      grid.addEventListener('pointermove', onPointerMove);
      grid.addEventListener('pointerout', onPointerOut);
      window.addEventListener('resize', invalidateRect, { passive: true });
      window.addEventListener('scroll', invalidateRect, { passive: true });

      return () => {
        resetActive();
        grid.removeEventListener('pointermove', onPointerMove);
        grid.removeEventListener('pointerout', onPointerOut);
        window.removeEventListener('resize', invalidateRect);
        window.removeEventListener('scroll', invalidateRect);
      };
    }, grid);

    return () => context.revert();
  });

  return () => {
    media.revert();
    delete grid.dataset.motionReady;
  };
}
