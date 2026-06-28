# Personal Database

Visor local en Astro para `games.json`, con cards, filtros y endpoints JSON de apoyo.

## Que incluye

- `src/pages/index.astro`: vista principal con cards y filtros.
- `src/lib/local-games.ts`: lectura local de `games.json`.
- `src/pages/api/games.json.ts`: listado filtrable.
- `src/pages/api/library.json.ts`: listado simple para consultas.
- `src/pages/api/stats.json.ts`: resumen agregado.
- `src/pages/api/stores.json.ts`: launchers detectados en la base.

## Arranque local

1. Entra en la raiz del repo `personal-database/`.
2. Instala dependencias:

```powershell
npm install
```

3. Arranca Astro:

```powershell
npm run dev
```

4. Abre `http://localhost:4321`.

La app lee `games.json` desde esta misma carpeta. La ruta real se resuelve en
`src/lib/local-games.ts`, que aun mantiene fallback al directorio padre por compatibilidad.

## Endpoints locales

```text
/api/games.json
/api/games.json?search=Ori
/api/games.json?estado=Terminado
/api/games.json?launcher=Steam
/api/games.json?plataforma=PC
/api/library.json
/api/library.json?search=Ori
/api/stores.json
/api/stats.json
```
