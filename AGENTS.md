# AGENTS.md - Personal Database

Shared notes for agents working inside the standalone app repository.

## Current repo root

- The GitHub-facing repo root is this folder: `personal-database/`.
- The outer `Games/` directory is only a local container and should not be treated as the app repo.
- The canonical local data file for the app is `games.json` in this folder.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`

## Key implementation rules

- `src/lib/local-games.ts` loads `games.json` from this folder first.
- `normalizeStatus()` must be used before comparing `estado` values.

## Regla de modularidad: límite de 1000 líneas

**Todo archivo que supere 1000 líneas debe ser refactorizado en módulos más pequeños.**

Cuando un archivo se acerque al límite, identificar bloques independientes y extraerlos:
- Páginas `.astro` → extraer secciones a `src/components/`
- Scripts `.ts` cliente → extraer utilidades/mapas a módulos separados
- CSS → un archivo por dominio visual

## Estructura de archivos

```
src/
  components/   ← UI puro (Sidebar.astro, CatalogFilters.astro, GameCard.astro…)
  layouts/      ← BaseLayout.astro
  lib/          ← Lógica de servidor (local-games.ts…)
  pages/        ← Solo orquestación, sin lógica pesada
  scripts/      ← Lógica cliente TypeScript (catalog.ts…)
  styles/       ← CSS por dominio (global.css, cards.css…)
```

## CSS

- `global.css` → variables, reset, componentes genéricos (badge, panel, stat…)
- `cards.css` → todo lo relacionado con `.mock-game-card` y el grid del catálogo
- **Sin `!important`** — usar especificidad y source-order en su lugar
- Las reglas de cards **nunca** van en `global.css`

## Patrón de paso de datos servidor → cliente

No mezclar `define:vars` con imports de módulos. Usar data attributes:

```astro
<div id="__catalog-data" data-games={JSON.stringify(games)} hidden></div>
<script>
  import { initCatalog } from '../scripts/catalog';
  const el = document.getElementById('__catalog-data');
  initCatalog(JSON.parse(el?.dataset.games ?? '[]'));
</script>
```

## Change log

2026-06-28 Codex - Renamed the app folder from `astro-games/` to `personal-database/`
and initialized this folder as the intended standalone Git repository root.
