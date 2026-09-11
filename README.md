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

### Altas automáticas de `games.json` → Blob

- Con `npm run dev` abierto y las credenciales de Blob en `.env.local`, se
  comprueban las altas al arrancar y al guardar `games.json` (espera de 400 ms
  para agrupar los eventos de guardado).
- Cada build de **producción en Vercel** importa también las altas del JSON
  del despliegue. Los builds locales y los de Preview no sincronizan datos.
- Solo se añaden títulos que no existen en Blob, usando la misma identidad
  normalizada que las rutas de juego. **Las fichas ya existentes en Blob no se
  sobrescriben**: conservan horas, logros, precios y ediciones online.
- No se borran juegos remotos al quitarlos del JSON. Renombrar un título cambia
  su identidad: no debe usarse la sincronización de altas para renombrar fichas.
- Esto no es una fusión bidireccional: `games.json` sigue siendo la fuente local
  y Blob la biblioteca persistente online. Para cambios de fichas existentes,
  usa el editor web; no se publican modificaciones locales automáticamente.
- Las escrituras verifican la versión ETag. Si coincide una edición online,
  se vuelve a leer y combinar (máximo tres intentos). Un Blob inexistente se
  crea sin permitir sobrescritura. No se escribe cuando no hay altas.

Comprobación manual, sin escribir:

```powershell
npm run sync:games:check
```

Sincronización manual (por ejemplo, si editaste con el servidor cerrado):

```powershell
npm run sync:games
```

Si faltan credenciales o falla la red, el servidor local sigue funcionando y
muestra el error en su terminal; puedes reintentar con el comando anterior.
En producción, un error de sincronización hace fallar el build para evitar un
despliegue que aparente haber incorporado las altas. No se registran tokens.
La credencial debe apuntar al Blob privado de esta biblioteca; no compartas
el mismo almacén con otro proyecto o una biblioteca de pruebas.

Pruebas de altas, conservación de datos, concurrencia y automatización:

```powershell
npm run test:games-sync
```

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
/api/games.json?golden=true
/api/library.json
/api/library.json?search=Ori
/api/stores.json
/api/stats.json
```
