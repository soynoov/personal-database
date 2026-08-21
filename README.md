# Personal Database

Base de datos personal en Astro para reunir y consultar distintos dominios de la vida del usuario. La primera vertical, y actualmente la principal, es la biblioteca de videojuegos almacenada en `games.json`.

El proyecto debe mantener separados los dominios de datos y sus interfaces para poder incorporar nuevas áreas en el futuro sin convertir el catálogo de videojuegos en una página monolítica.

## Que incluye

- `src/pages/index.astro`: vista principal con cards y filtros.
- `src/lib/local-games.ts`: lectura local de `games.json` y persistencia privada en Vercel Blob.
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

## Edicion en produccion

En desarrollo, los formularios de la ficha escriben directamente en `games.json`.
En Vercel, la app lee y escribe `personal-database/games.json` dentro de un Blob
privado. El JSON incluido en el repositorio sigue siendo el respaldo inicial si
el Blob todavia esta vacio.

Para habilitarlo en otro proyecto de Vercel:

1. Conecta un Vercel Blob privado al proyecto para que exista `BLOB_READ_WRITE_TOKEN`.
2. Define `ADMIN_PASSWORD` en Production y Preview.
3. Despliega de nuevo.

Al intentar guardar por primera vez, la interfaz solicita esa contraseña. El
servidor crea una cookie HttpOnly y SameSite durante 30 dias; la contraseña no
se almacena en el navegador. Las escrituras usan ETag para rechazar cambios
simultaneos en lugar de sobrescribirlos silenciosamente.

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
