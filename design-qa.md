# Design QA — Game Cards

## Comparison target

- Visual source of truth: `docs/design-standardization/assets/43-golden-three-beam-proposed.png` (`1485 × 1059`).
- Current-state reference: `docs/design-standardization/assets/19-card-standard-hover-current.png`.
- Focused comparison: `artifacts/design-qa/game-cards-source-vs-implementation.png` (`1100 × 1325`).
- Desktop implementation: `artifacts/design-qa/game-cards-final-hover-desktop.png` and `artifacts/design-qa/game-cards-final-golden-real-data.png` (`1440 × 1024`).
- Responsive implementation: `artifacts/design-qa/game-cards-final-tablet.png` (`820 × 1180`) and `artifacts/design-qa/game-cards-final-mobile.png` (`390 × 844`).
- Keyboard state: `artifacts/design-qa/game-cards-final-focus.png` (`1440 × 1024`).
- Browser density: device scale factor `1` in Chromium.
- Route: `http://127.0.0.1:4324/`.
- State: dark theme; standard card hover, real-data Golden hover, forced same-cover Golden comparison, keyboard focus, responsive and reduced motion.

The Golden proposal is normative for the optical material and pointer states. The live card anatomy, text and responsive layout continue to follow `theme.css` and the operational catalog rather than copying the mockup composition.

## Findings

- No actionable P0, P1 or P2 visual differences remain within this slice.
- The cover and information surface now overlap through a progressive transparent-to-dark gradient. The previous horizontal seam is absent on desktop, tablet and mobile.
- The cover image retains `transform: none`; only the complete card scales to `1.012`.
- Tilt remains capped at `±2.4deg`. A single normalized pointer reading drives tilt, shadow, perimeter light and all three Golden beams.
- Golden now uses one broad white/warm-gold reflection plus two narrower parallel reflections with restrained cyan and magenta fringes.
- The three reflections move together with small spatial parallax and no automatic sweep or delayed trail.
- The active card returns to rest over `250ms`; live tracking uses an interruptible `84ms` transition.
- Only one card owns the optical variables at a time. Leaving the card removes every inline optical property.
- Touch, widths through `820px` and `prefers-reduced-motion: reduce` retain the Golden border and trophy while disabling tilt, scale and dynamic foil.
- `:focus-visible` reveals the same information as hover and shows a visible theme-colored outline.

## Full-view comparison evidence

- `game-cards-final-hover-desktop.png` verifies the standard card, full-card scale and uninterrupted cover/body transition in the live catalog.
- `game-cards-final-golden-real-data.png` verifies Golden on the real Far Cry 3 data state, without altering `games.json` for QA.
- `game-cards-final-tablet.png` and `game-cards-final-mobile.png` verify that the gradient does not introduce clipping or horizontal overflow.

## Focused comparison evidence

- `game-cards-source-vs-implementation.png` places the approved Golden proposal and the implementation in one image for top-left, center and bottom-right pointer states.
- The implementation preserves the target hierarchy: one dominant reflection, two visibly smaller followers, a gold perimeter and an unwashed cover outside the beams.
- The live reflection is intentionally a little less opaque over labels than the proposal so title, badges and metrics remain readable.

## Interaction and accessibility checks

- Pointer sweep: verified through six consecutive positions at approximately one frame intervals; no stale card or detached reflection remained.
- Mutual exclusion: one `.is-tracking` card at most.
- Exit state after `320ms`: computed card transform `none`, foil opacity `0`, zero active tracking classes and no residual inline style.
- Reduced motion: computed transform `none`, foil `display: none`, Golden border preserved and information reveal shortened to `100ms`.
- Responsive overflow: document width equals viewport width at `820px` and `390px`.
- Image zoom: computed image transform remains `none` during hover.
- Keyboard: focused card matches `:focus-visible`, reveals its body and exposes a `2px` outline.
- WCAG A/AA scan scoped to `.mock-cards-grid`: zero violations. Eight contrast checks were indeterminate because the analyzer cannot resolve pseudo-element backgrounds; none was reported as a violation.
- Browser console and page errors: no application errors; only Vite development connection messages.

## Comparison history

- Baseline: the body could read as a hard horizontal cut and Golden rendered a single moving band.
- Iteration 1: introduced a dedicated foil layer and three beams, but the main reflection travelled too far off-card at opposing corners.
- Iteration 2: reduced and differentiated the three parallax ranges so the large beam and both followers remain coherent across the card.
- A radial localization pass was tested and rejected because it weakened the requested “brilli brilli” read and hid the secondary beams.
- Final pass: replaced rectangular backdrop blur with an explicit alpha gradient, masked the noise texture independently, added reduced-motion/touch fallbacks and verified the real Golden state.

## Implementation checklist

- [x] Restore the cover/body gradient without a visible seam.
- [x] Keep the cover image free of independent zoom.
- [x] Scale the complete card subtly on precise-pointer hover.
- [x] Coordinate tilt, shadow and light from one pointer reading.
- [x] Replace the single Golden band with one main and two follower beams.
- [x] Preserve a single active card and settle cleanly on exit.
- [x] Support focus, touch and reduced motion.
- [x] Verify desktop, tablet, mobile, build, console and accessibility.

## Open questions

- None blocking.

final result: passed
