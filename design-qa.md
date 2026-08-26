# Design QA — Hero de ficha técnica

- Source visual truth: `C:\Users\heroy\AppData\Local\Temp\codex-clipboard-e1c61ff6-200a-419a-b616-dc2fd72f6448.png`
- Implementation screenshot: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\05-hero-fixed-continuous.png`
- Side-by-side comparison: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\06-reference-vs-fixed.png`
- Viewport: 1206 × 600 CSS px; desktop, dark theme, top of Burgie's Cozy Kitchen detail page.
- Density normalization: browser capture at devicePixelRatio 1. Source is 1199 × 255 px. The 1187 × 249 implementation content crop was normalized to 1199 × 255 px for direct comparison.
- Responsive evidence: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\07-hero-fixed-mobile.png` at 749 × 600 CSS px.
- Long-title evidence: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\hero-long-title.png` at 1206 × 600 CSS px.
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
4. User follow-up: P2 — the frosted left-to-right fade and the reference's diagonal navigation seam were still missing. Added a masked backdrop blur and a measured 26 × 32 px diagonal transition.
5. User review: P1 — the filled diagonal remained a detached opaque block; P2 — two stacked frosted layers made the horizontal fade visibly artificial.
6. Final correction: removed the secondary `backdrop-filter`, reduced the single horizontal overlay, and extended the hero's own continuous background through a measured 26 × 33 px diagonal. Post-fix evidence is `artifacts/design-qa/06-reference-vs-fixed.png`. Desktop and 749 px responsive views have no text or viewport overflow; navigation to `#technical` works and the console contains no errors.

## Findings

No actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: artwork color and focal subject naturally vary by game because the page uses live dynamic hero assets.

final result: passed
