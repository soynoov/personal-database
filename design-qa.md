# Design QA — Game Cards · frost y foil dinámico

## Comparison target

- Fuente visual principal: `C:/Users/heroy/AppData/Local/Temp/codex-clipboard-ad2b3d11-d4b1-4f86-b74e-986187356e3b.png` (`973 × 705` px). Define el material Golden en reposo, puntero arriba-izquierda, centro y abajo-derecha.
- Evidencia del defecto de frost: `C:/Users/heroy/AppData/Local/Temp/codex-clipboard-0930a3f0-bdeb-4673-8efd-bf44e0616b43.png` (`309 × 488` px). No es un objetivo visual: documenta la portada desenfocada que debe corregirse.
- Comparación normalizada del foil: `artifacts/design-qa/game-card-foil-proposal-vs-implementation.png` (`1946 × 705` px); fuente e implementación aparecen juntas a la misma altura y densidad.
- Hoja de estados implementada: `artifacts/design-qa/game-card-foil-motion-states.png` (`973 × 705` px).
- Comparación focal del frost: `artifacts/design-qa/game-card-frost-before-vs-after.png` (`660 × 540` px).
- CSS viewport / densidad: `1440 × 1024`, `820 × 1180` y `390 × 844`; `deviceScaleFactor: 1` en Chromium.
- Ruta: `http://127.0.0.1:4325/`.
- Estado: tema oscuro; Marvel Rivals Golden; puntero preciso en reposo, centro y extremos opuestos.

La hoja propuesta se usa como verdad visual del foil, no como especificación del patrón de revelado del contenido. En la aplicación, el panel continúa apareciendo con hover; ese comportamiento no forma parte de esta corrección.

## Findings

- No quedan diferencias P0, P1 o P2 accionables en esta iteración.
- La portada superior permanece nítida. `.card-cover::before` ya no genera ni desenfoca ninguna superficie (`content: none`, `backdrop-filter: none`).
- El frost queda restringido a `.card-body`: `blur(20px) saturate(1.08)` con una máscara progresiva de `48px`. El degradado oscuro sigue llegando prácticamente opaco a Horas.
- El foil ya no anima posiciones internas de fondo sobre una capa fija. Los tres haces forman un único plano óptico que se traslada y rota con el puntero, por lo que mantienen entre sí anchura, separación y dirección.
- El haz principal conserva más área e intensidad; los dos reflejos secundarios permanecen estrechos. El grupo queda limitado espacialmente y no lava toda la portada.
- Reposo: foil invisible. Salida de puntero: desaparición y retorno al centro mediante la transición existente. Solo la card activa recibe `.is-tracking`.

## Full-view comparison evidence

- `game-card-foil-proposal-vs-implementation.png` muestra la propuesta y los cuatro estados implementados en una sola composición. La dirección cambia de diagonal descendente hacia la derecha en arriba-izquierda a diagonal descendente hacia la izquierda en abajo-derecha, mientras el grupo recorre físicamente la superficie.
- La lectura normalizada y el plano óptico cambian de forma comprobada:
  - Arriba-izquierda: puntero `-0.7961 / -0.8406`, desplazamiento `-149.74px / -64.85px`, ángulo `-14.29deg`.
  - Centro: puntero `0.0001 / -0.0013`, desplazamiento `0.02px / 27.31px`, ángulo `8deg`.
  - Abajo-derecha: puntero `0.7964 / 0.8424`, desplazamiento `149.78px / 119.95px`, ángulo `30.30deg`.
- Las ejecuciones responsive a `820px` y `390px` confirmaron ausencia de clipping y desbordamiento horizontal.

## Focused comparison evidence

- `game-card-frost-before-vs-after.png` compara la incidencia con Counter-Strike 2 tras la corrección. Logo, líneas diagonales y personaje vuelven a ser legibles en la portada; solo el panel inferior recibe vidrio y oscuridad progresiva.
- En la comparación del foil, el estado central conserva un haz ancho y dos haces finos claramente diferenciados. En los extremos, el grupo entra y sale por el borde como un reflejo sobre una superficie inclinada, en lugar de permanecer centrado.
- La imagen continúa con `transform: none`; no se ha reintroducido zoom independiente de portada.

## Required fidelity surfaces

- Fonts and typography: familia, peso, tamaño, interlineado, tracking y wrapping no cambian. El foil cruza el contenido como material superficial sin alterar su geometría.
- Spacing and layout rhythm: dimensiones, padding, radios y grid permanecen intactos; el hover de la card completa conserva `scale(1.02)` y `z-index: 20`.
- Colors and visual tokens: el reflejo usa los tokens `--card-foil-cyan`, `--card-foil-magenta`, `--card-foil-gold` y `--card-foil-glint`; frost y oscuridad usan `--card-blur`, `--theme-black` y `--card-body-fade`.
- Image quality and asset fidelity: se mantiene la portada real servida por `/api/cover`, sin blur en la zona superior, zoom, sustituciones ni assets raster nuevos.
- Copy and content: títulos, badges, horas y datos secundarios no se modifican.

## Interaction and accessibility checks

- La misma lectura normalizada de puntero controla tilt, sombra, brillo periférico, traslación y ángulo del foil.
- El foil se activa con `.is-platinum.is-tracking`; no existe un haz centrado fijo como fallback de hover.
- Tablet `820px` y móvil `390px`: `transform: none`, foil `display: none`, distintivo Golden conservado y overflow horizontal `0`.
- `prefers-reduced-motion: reduce`: card sin transform, sin tracking, foil `display: none` y trofeo Golden visible.
- WCAG A/AA en la ruta completa: `0` violaciones. Axe deja `38` nodos de contraste como indeterminados porque no resuelve sus fondos con gradiente.
- Runtime: página con contenido, sin overlay de Vite y sin errores de navegador observados.
- Build: `npm run build` completado correctamente.

## Comparison history

1. Estado anterior: un pseudo-elemento con `backdrop-filter` cubría toda la portada. Aunque estaba enmascarado, Chromium componía el blur sobre la imagen completa y eliminaba su detalle visible.
2. Estado anterior del foil: los fondos se desplazaban, pero el plano conservaba un ángulo fijo de `-18deg`; el reflejo podía percibirse como una decoración anclada a la card.
3. Primera corrección: se eliminó el blur de `.card-cover` y se trasladó al panel inferior con máscara progresiva. Se sustituyeron las posiciones de fondo por un grupo óptico con traslación bidimensional y rotación derivadas del puntero.
4. Evidencia posterior: la comparación focal muestra la portada nítida; la hoja de estados confirma cambios simultáneos y amplios de posición y ángulo entre las tres lecturas del puntero.

## Implementation checklist

- [x] Mantener nítida la portada.
- [x] Limitar el frosted al panel de información.
- [x] Conservar el degradado progresivo y la opacidad en Horas.
- [x] Dibujar un haz principal ancho y dos secundarios estrechos.
- [x] Mover y rotar los tres haces con la misma lectura usada por el tilt.
- [x] Evitar foil fijo cuando JavaScript no está siguiendo el puntero.
- [x] Mantener fallbacks táctil y de movimiento reducido.
- [x] Verificar desktop, tablet, móvil, build, runtime y accesibilidad.

## Follow-up polish

- P3 opcional: ajustar unos pocos grados o píxeles el recorrido tras probarlo con la velocidad real de ratón del usuario; no existe ahora una desviación estructural respecto a la propuesta.

final result: passed
