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

---

# Design QA — Bloques planos de ficha

- Source visual truth: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\hours-1440-final.png`
- Implementation screenshots: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\finance-1440-final.png`, `data-1440-final.png`, `metacritic-1440-final.png`
- Combined comparison input: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\flat-blocks-source-vs-implementation.png`
- Focused graph evidence: `C:\Users\heroy\OneDrive\Escritorio\PROJECT\personal-database\artifacts\design-qa\finance-market-1440-final.png`
- Responsive evidence: `finance-900-final.png`, `data-900-final.png`, `metacritic-900-final.png`, `finance-390-final.png`, `data-390-final.png`, `metacritic-390-final.png`
- Viewports: 1440 × 1200, 900 × 1400, and 390 × 1800/1900 CSS px; dark theme; section-isolated states.
- Density normalization: deviceScaleFactor 1. The source is 1440 × 920 px. Desktop implementations are 1440 × 1200 px and were cropped to the same 1440 × 920 comparison region. The combined board is 2880 × 1840 px.
- Primary interactions tested: Mercado expand/collapse; Dinero, Datos, and Metacrítica editor open/close with Escape; detail navigation to `#finance`; home route rendering.
- Console/page errors checked: none in the final browser runs.
- Accessibility: scoped WCAG 2 A/AA audits report 0 violations for `#finance`, `#technical`, and `#metacritica`. Finance retains one axe incomplete result where overlap prevents automatic contrast calculation; it is not a detected violation.

## Full-view comparison evidence

Dinero, Datos, and Metacrítica now reuse the approved Hours language: one solid section surface, independent inset cards, 15 px major radii, 12–13 px secondary radii, restrained one-pixel borders, flat icon wells, no gradients, no shadows, and no backdrop blur. Data density and ordering remain domain-specific instead of forcing identical layouts.

Dinero preserves the economic goal, recorded spend, amortization multiple, progress bar, five KPI states, spend breakdown, market disclosure, price graph, discount, and price references. Datos preserves all three groups and every metadata/null state. Metacrítica preserves all three scores, all applicable criteria, progress bars, formula chips, conditional community criterion, and conditional honorary mention.

## Focused comparison evidence

The focused Mercado capture confirms that the original line/area price graph remains visible, correctly sized at 771 × 218 canvas pixels, and integrated into the same flat card system. Focused mobile captures confirm readable two-column KPIs where space allows and single-column content where labels need the full width.

## Required fidelity surfaces

- Fonts and typography: the product's existing display/body fonts and optical hierarchy remain intact. Section headings, uppercase labels, primary figures, metadata, and null-state notes match the approved Hours weight and spacing rhythm without truncation.
- Spacing and layout rhythm: desktop uses a 12-column bento; 900 px retains the compact desktop composition; 390 px collapses without overflow. The last odd financial KPI spans the mobile row to avoid a visible hole.
- Colors and visual tokens: solid `#12131c`, `#0e0f17`, and `#0b0c13` surfaces replace the former glass/gradient layers. Purple is limited to accents and progress; green remains a semantic amortized state. Empty data is greyed without losing WCAG contrast.
- Image quality and asset fidelity: these blocks contain no target raster imagery. Existing Tabler icons and the Chart.js canvas are preserved; no placeholder, CSS-drawn, inline-SVG, or synthetic replacement assets were introduced.
- Copy and content: all existing dynamic labels and values remain. Marvel Rivals still exposes only Micropagos in its spend breakdown and omits HLTB; a level-0 honorary mention stays hidden; Originalidad remains present.
- Icons and controls: edit icons are visible and aligned in consistent 40 px controls. The Metacrítica label is visually removed while its accessible label remains.
- States and interactions: complete, incomplete, free-to-play, empty metadata, market-open, form-open, and Escape-close states were exercised without errors or data mutation.

## Comparison history

1. Baseline: P1 — Dinero, Datos, and Metacrítica used divider-led rows that no longer matched the approved Hours bento; P1 — global glass rules retained gradients, blur, and shadow on these blocks.
2. First implementation: introduced the shared flat surfaces and preserved all content. P2 — the Metacrítica edit icon was hidden together with its text; P2 — 900 px stacked cards too early; P2 — an odd financial KPI left an empty mobile grid cell; P2 — dimmed null metadata failed automated contrast.
3. Final implementation: limited text hiding to the non-icon span, retained the desktop bento at 900 px, expanded the last odd mobile KPI, and replaced parent opacity with accessible muted text tokens. Post-fix evidence is the combined comparison board and the final 900/390 captures. No actionable P0/P1/P2 findings remain.

## Findings

No actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: games with unusually long localized values may need a future content-specific truncation review; current acceptance cases do not overflow.

final result: passed
