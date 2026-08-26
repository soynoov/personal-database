# Design QA — Hero de ficha técnica

- Source visual truth: `C:\Users\heroy\AppData\Local\Temp\codex-clipboard-b6dcbe97-a039-4e38-b387-243e3e46f87c.png`
- Implementation screenshot: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\hero-after-final.png`
- Normalized implementation crop: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\hero-implementation-crop.png`
- Side-by-side comparison: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\hero-comparison.png`
- Viewport: 1206 × 600 CSS px; desktop, dark theme, top of Burgie's Cozy Kitchen detail page.
- Density normalization: browser capture at devicePixelRatio 1. Source is 1199 × 255 px. The 1206 × 255 implementation crop was downsampled to 1199 × 255 px for direct comparison.
- Responsive evidence: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\hero-mobile.png` at 390 × 844 CSS px.
- Primary interaction tested: clicking “Datos” updates the URL to `#technical`, scrolls the section into view, and changes the active tab to “Datos”.
- Console errors checked: none in the final browser run.

## Full-view comparison evidence

The final hero matches the reference composition: 180 px panoramic band, 136 × 168 px cover aligned at the same horizontal origin, display title and badges centered in the copy column, cover overlap across the navigation seam, left-to-right frosted fade, diagonal cutout, and an editorial tab bar directly below. “Resumen” is absent and “Horas” is the first active tab.

The background artwork differs because the implementation uses each game's canonical dynamic hero asset. This is an intentional product constraint; the treatment, crop, blur, contrast, and foreground hierarchy match the reference direction.

## Required fidelity surfaces

- Fonts and typography: existing display and body families retained; title scale, line height, optical weight, and badge hierarchy are aligned with the source.
- Spacing and layout rhythm: poster, title, badges, hero height, 26 × 32 px diagonal navigation cut, cover overlap, and first-tab offset align closely after normalization.
- Colors and visual tokens: the frosted layer is strongest at the left and fades toward transparency at the right; the dark violet surface, purple active state, semantic status badges, and subdued background overlay remain consistent with the product theme and reference.
- Image quality and asset fidelity: real cover and dynamic hero assets are used; no placeholder, CSS-drawn, or synthetic replacement imagery was introduced.
- Copy and content: title and metadata remain data-driven. The requested “Resumen” label was removed. Indie, Early Access, and play-mode badges surface the metadata previously hidden in the facts row.

Focused region comparison was not needed because the supplied source is itself a focused hero crop and all typography, badges, poster edges, and navigation labels are readable at 1:1 normalized size.

## Comparison history

1. Baseline: P1 — nested glass card and three-column facts row made the hero too tall and dense; P1 — obsolete “Resumen” tab remained.
2. First implementation: removed the facts row and obsolete tab, then matched title/poster alignment. P2 — hero still had excess vertical height and the cover did not overlap the navigation seam correctly.
3. Final implementation: fixed the 180 px frame, 168 px poster, 7 px seam overlap, background treatment, badge set, and navigation offset. Post-fix evidence is `hero-comparison.png`; no actionable P0/P1/P2 differences remain.
4. User follow-up: P2 — the frosted left-to-right fade and the reference's diagonal navigation seam were still missing. Added a masked 13 px backdrop blur that fades across the hero and a measured polygonal cut from x=195 to x=221 over 32 px. The final comparison confirms both details without horizontal overflow or mobile clipping.

## Findings

No actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: artwork color and focal subject naturally vary by game because the page uses live dynamic hero assets.

final result: passed
