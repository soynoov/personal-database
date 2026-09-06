# Design QA — Game Cards · corrección de feedback

## Comparison target

- Visual source of truth: `C:/Users/heroy/AppData/Local/Temp/codex-clipboard-5d6af491-da47-4084-b70b-594e11808efb.png` (`305 × 480` px). La captura documenta el estado defectuoso señalado por el usuario: franja superior, pérdida de frosted y fondo demasiado transparente en Horas.
- Focused implementation: `artifacts/design-qa/game-card-feedback-card-after.png` (`266 × 466` px).
- Combined comparison input: `artifacts/design-qa/game-card-feedback-source-vs-implementation.png` (`820 × 600` px).
- Full desktop implementation: `artifacts/design-qa/game-card-feedback-hover-after-first.png` (`1440 × 1024` px).
- Golden states: `artifacts/design-qa/game-card-golden-marvel-center-after.png` (`266 × 466` px), `game-card-golden-marvel-top-left-after.png` (`268 × 468` px) y `game-card-golden-marvel-bottom-right-after.png` (`268 × 469` px).
- Responsive implementation: `artifacts/design-qa/game-card-feedback-tablet-820.png` (`820 × 1180` px) y `artifacts/design-qa/game-card-feedback-mobile-390.png` (`390 × 844` px).
- CSS viewport / density: `1440 × 1024`, `820 × 1180` y `390 × 844`; `deviceScaleFactor: 1` en Chromium.
- Route: `http://127.0.0.1:4325/`.
- State: tema oscuro; hover de puntero preciso; Golden centrado y en esquinas opuestas; tablet, móvil y movimiento reducido.

La captura del usuario no es un objetivo que deba clonarse literalmente: es la evidencia del defecto. La comparación se evalúa contra las correcciones explícitas pedidas y contra los tokens operativos de `theme.css`.

## Findings

- No quedan diferencias P0, P1 o P2 accionables en esta iteración.
- La banda superior de 16 px desaparece. El pseudo-elemento de transición ocupa ahora toda la portada (`453.531px` en la card desktop comprobada), en vez de heredar la altura bento antigua.
- El material frosted vuelve mediante una capa de blur enmascarada. Su entrada es gradual y no crea un nuevo límite rectangular.
- Al llegar a Horas, la combinación de oscurecimiento de portada y superficie del body es visualmente casi opaca; la silueta deja de competir con el dato.
- La portada conserva `transform: none`: no existe zoom independiente de imagen.
- El hover escala la card completa a `1.02` y eleva el elemento activo a `z-index: 20`.
- Marvel Rivals aparece como Golden tanto tras el SSR como después del filtrado/re-render cliente. El catálogo local contiene tres Golden verificadas: Marvel Rivals, Far Cry 3 y Blasphemous 2.

## Full-view comparison evidence

- `game-card-feedback-hover-after-first.png` confirma en el grid real que la card activa crece sin quedar por debajo de sus hermanas y que la unión portada/body no presenta franja.
- `game-card-feedback-tablet-820.png` y `game-card-feedback-mobile-390.png` confirman el borde y distintivo Golden estáticos, sin clipping ni desbordamiento horizontal.
- En ambos breakpoints responsive, `document.documentElement.scrollWidth` coincide con `clientWidth`.

## Focused comparison evidence

- `game-card-feedback-source-vs-implementation.png` coloca la captura original y la captura corregida en la misma composición.
- La comparación muestra tres cambios visibles: se elimina la franja negra superior, el desenfoque vuelve a fundir portada y panel, y la zona de Horas pasa de dejar visible la ilustración a una lectura casi opaca.
- No se detectan cambios no solicitados en tipografía, jerarquía, badges, radio o crop de la portada.
- Las tres capturas Golden confirman que el haz principal y los dos secundarios se trasladan juntos. En la comprobación extrema, el tilt pasó de `2.40deg / -2.18deg` a `-2.09deg / 2.20deg`, mientras el haz principal pasó de `-99.54px / -41.18px` a `100.38px / 35.86px`.

## Required fidelity surfaces

- Fonts and typography: familia, peso, tamaño, interlineado y wrapping no se modificaron; título, badges y cifra de Horas mantienen la jerarquía operativa.
- Spacing and layout rhythm: se conserva la geometría base; el único cambio dimensional es el crecimiento solicitado de `1.012` a `1.02`. No aparece overflow en `1440`, `820` o `390` px.
- Colors and visual tokens: frosted, blur, negro, foil y borde usan `--card-glass`, `--card-blur`, `--theme-black` y los tokens `--card-foil-*` existentes.
- Image quality and asset fidelity: se conserva la portada real servida por `/api/cover`, sin reescalado animado, sustituciones ni assets nuevos.
- Copy and content: el contenido visible no cambia. El nombre accesible de Marvel Rivals incluye `100% de logros completados` tras reconciliar el dato local `49 / 49` con el Blob de producción.

## Interaction and accessibility checks

- Seguimiento de puntero: centro y dos esquinas opuestas comprobados; tilt, sombra y tres haces responden a la misma lectura normalizada.
- Apilado: `z-index: 20` comprobado durante hover.
- Movimiento reducido: `transform: none`, foil `display: none` y distintivo Golden conservado.
- Táctil / ancho `≤820px`: sin tilt ni foil dinámico; Golden mantiene borde y trofeo.
- Cliente: el filtro de búsqueda fuerza el re-render y Marvel Rivals sigue recibiendo `.is-platinum`.
- WCAG A/AA en la ruta completa: `0` violaciones; `29` nodos de contraste quedan indeterminados porque axe no resuelve sus fondos con gradiente.
- Consola y runtime: sin overlay de Vite ni errores de página observados.
- Build: `npm run build` completado correctamente.

## Comparison history

1. Estado inicial: el degradado nuevo heredaba `height: 16px` de `.cards-bento .card-cover::after`, comprimiéndose en una franja superior; el body no tenía blur, terminaba al `94%` y el hover usaba `scale(1.012)` / `z-index: 2`.
2. Diagnóstico de datos: el Blob de producción contenía Marvel Rivals con `49 / 49` logros, mientras `games.json` local contenía `null / null`. No había una segunda base cliente: SSR y cliente reciben la misma proyección de `readGames()` dentro de cada entorno.
3. Corrección: se reseteó la geometría del pseudo-elemento, se añadió frost enmascarado, se elevó la opacidad final al `98%`, se aumentó hover/apilado y se reconciliaron únicamente los logros confirmados de Marvel Rivals en el JSON local.
4. Evidencia posterior: comparación combinada sin franja, Horas casi opaco, tres Golden locales, foil coherente en posiciones opuestas y responsive sin overflow.

## Implementation checklist

- [x] Restaurar frosted con entrada gradual.
- [x] Eliminar la franja heredada de 16 px.
- [x] Alcanzar una superficie prácticamente opaca en Horas.
- [x] Mantener la portada sin zoom independiente.
- [x] Aumentar ligeramente el tamaño de hover y elevar su apilado.
- [x] Mostrar Marvel Rivals como Golden en los datos locales y en el re-render cliente.
- [x] Conservar los tres haces ligados al puntero y los fallbacks táctil/reducido.
- [x] Verificar desktop, tablet, móvil, build, consola y accesibilidad.

## Open questions

- La biblioteca local (`157` juegos) y el Blob de producción (`155`) siguen siendo almacenes distintos por diseño y contienen muchas diferencias ajenas a esta corrección. No se ha hecho una sincronización masiva porque podría sobrescribir ediciones válidas de producción. Esta iteración solo reconcilia el dato Golden confirmado de Marvel Rivals.

final result: passed
