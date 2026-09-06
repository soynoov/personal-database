**Comparison Target**

- Source visual truth: `C:\Users\heroy\AppData\Local\Temp\codex-clipboard-5e4fdbfc-0388-41c6-b8ad-ad8f1225bce0.png`
- Desktop implementation: `artifacts/design-qa/hours-benchmarks-focused-1100.png`
- Full-page implementation: `artifacts/design-qa/hours-benchmarks-full-1440.png`
- Mobile implementation: `artifacts/design-qa/hours-benchmarks-390.png`
- Route: `http://127.0.0.1:4322/games/hogwarts-legacy/#hours`
- Desktop viewport: `1100 x 1000`, device scale factor `1`; mobile viewport: `390 x 1100`, device scale factor `1`.
- Source pixels: `1055 x 398`; focused implementation: `1100 x 1000`; mobile implementation: `390 x 1100`.
- State: dark theme, Hogwarts Legacy with complete HLTB references, 59,99 € amortization target and 102 h 36 min played.
- Requested delta: four straight benchmark bars in the order Historia, Historia+, 100%, Amortización; player hours represented exclusively by a labeled horizontal line.

**Findings**

- No actionable P0, P1 or P2 differences remain.
- The chart now separates benchmark values from the player's current value: four bars versus one horizontal reference line.
- Bar order is fixed and independent of magnitude.
- The line label shows `Mis horas · 102 h 36 min` without relying on hover.
- Mobile preserves all four labels, values and the line annotation without horizontal overflow.

**Required Fidelity Surfaces**

- Fonts and typography: existing font family, weights and chart hierarchy remain; the line annotation uses the same UI font and a compact high-contrast label.
- Spacing and layout rhythm: the chart keeps the established height and grid while distributing four equal rectangular bars.
- Colors and visual tokens: HLTB remains lavender, Amortización uses the existing economic gold and Mis horas retains its semantic comparison color.
- Image quality and asset fidelity: no raster assets were introduced; the existing Tabler chart icon remains unchanged.
- Copy and content: the heading now describes all objectives rather than only HLTB; labels are Historia, Historia+, 100% and Amortización.

**Full-view Comparison Evidence**

- `artifacts/design-qa/hours-benchmarks-full-1440.png` verifies the revised chart remains consistent with Hours, Dinero and the surrounding game sheet.

**Focused Region Comparison Evidence**

- The source showed Mis horas as both a bar and an unlabeled horizontal line, with no Amortización bar.
- `artifacts/design-qa/hours-benchmarks-focused-1100.png` confirms the redundant player-hours bar is removed, Amortización is added in fourth position and the line carries its exact value.
- `artifacts/design-qa/hours-benchmarks-390.png` confirms the same semantic order and visible annotation on mobile.

**Interaction and Accessibility Checks**

- Browser console: no application errors; only Vite development connection messages.
- WCAG A/AA scan for `#hours`: zero violations. Three contrast checks were indeterminate because elements were overlapped during analysis; none was reported as a violation.
- The canvas exposes a descriptive accessible label containing every benchmark and Mis horas.

**Comparison History**

- Iteration 1: the reference exposed ambiguous duplication because Mis horas appeared as both a bar and a line, while the economic goal was absent.
- Fixes: square benchmark bars, calculated real-hour amortization target, fixed ordering, labeled reference line and responsive accessible description.
- Post-fix evidence: desktop and mobile captures show no clipping, overlap or remaining P0/P1/P2 finding.

**Open Questions**

- None blocking.

**Implementation Checklist**

- [x] Add real-hour amortization target to financial metrics.
- [x] Render four ordered, square benchmark bars.
- [x] Render player hours only as a labeled line.
- [x] Preserve responsive chart labels.
- [x] Verify build, finance calculations, desktop, mobile, console and accessibility.

**Follow-up Polish**

- No P3 item is required for this handoff.

final result: passed
