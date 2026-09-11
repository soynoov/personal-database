# Design QA — Golden en ficha, bento Detalles y pastillas · 2026-09-11

## Findings

No quedan diferencias P0/P1/P2 accionables en el alcance implementado. La auditoría se ha adaptado al bloque Detalles, no se ha reproducido su tablero completo de Dinero. Horas, Dinero, gráficas y datos no se han modificado.

## Comparison target and evidence

- Fuente normativa: `DESIGN-STANDARDIZATION-AUDIT.md`, sección 5.4, y tokens actuales de `src/styles/theme.css`.
- Fuente visual bento: `docs/design-standardization/assets/47-game-detail-bento-data-states-proposed.png`, 1536 × 1024 px. Su panel Detalles define las variantes Steam/no Steam, completitud y mínimos datos; la distribución de esta entrega adapta la retícula de 12 columnas descrita en el documento.
- Fuente visual de pastillas aprobada: `C:/Users/heroy/.codex/generated_images/01a0765a-e9e2-70d3-80f3-355a09b42efc/exec-da01161a-a53b-47ed-afff-5405a9a556b1.png`, 1487 × 1058 px. La columna derecha es el objetivo.
- Ruta principal: `http://127.0.0.1:4321/games/marvel-rivals/`; catálogo `/?golden=true`. Tema oscuro; datos reales de desarrollo; no se guardaron formularios.
- Chromium con Playwright directo, expresamente autorizado por el usuario. Viewports CSS: 1440 × 1024, 820 × 1180 y 390 × 844; deviceScaleFactor 1. También contexto táctil de iPhone 12 a 390 × 844.
- Capturas de Detalles por elemento: `.codex-qa/golden-detail-1440.png` (1416 × 614), `golden-detail-820.png` (796 × 801) y `golden-detail-390.png` (378 × 1054). El recorte excluye navegación y no simula la altura total de una pantalla móvil.
- Comparación conjunta de composición: `.codex-qa/golden-bento-comparison.png`, con fuente, escritorio, tablet, móvil y estado vacío. Reducción proporcional para presentar la hoja; tipografía y wrapping revisados además en las capturas nativas abiertas.
- Comparación focal de pastillas: `.codex-qa/golden-pills-comparison.png`. Fuente e implementación normalizadas a una altura de card aproximada de 568 px. Captura real hover de 289 × 505 px. La posición del reflejo no es un objetivo estático: cambia con el puntero.
- Fondo en posiciones opuestas: `.codex-qa/golden-background-left.png` y `golden-background-right.png`, 1440 × 1024. Los haces quedan detrás de las superficies de datos.
- Las capturas y scripts de navegador en `.codex-qa/` son evidencia local ignorada por Git; no se publican como parte de la aplicación. Este informe sí queda versionado.

## Required fidelity surfaces

- Fonts and typography: se conservan las familias del producto; pastillas de 10 px, sin reducción del texto. Progreso tiene la cifra protagonista y los secundarios una escala menor. Wrapping móvil comprobado en etiquetas largas; no hay recortes ni overflow de celdas. No se usan los textos generados del mock como datos de la aplicación.
- Spacing and layout rhythm: retícula 12 columnas con Progreso 7/12 y dos apoyos 5/12; gaps de 12 px y radios jerárquicos 32/16/8 px. A 820 px, Progreso ocupa todo el ancho; a 390 px los grupos se ordenan verticalmente, manteniendo secundarios de dos columnas. La card de catálogo crece a 1.10 y conserva z-index 20.
- Colors and tokens: superficies opacas en Detalles con bordes sobrios y acento violeta; Golden usa los tokens dorados existentes. Las pastillas de plataforma/launcher son neutras, las de estado conservan color semántico con relleno 8 % y borde 18 %. No cambian los filtros ni sus targets.
- Image quality and assets: portada original y Tabler existentes, sin nuevos assets recreados; la portada no recibe zoom propio (`transform: none`). Se conserva la capa inferior de frosted y el degradado. El foil de la ficha es una superficie decorativa sin eventos por debajo del contenido, no un filtro sobre la imagen o el texto.
- Copy and content: se mantienen valores reales, cero válido y diferencias entre vacío/no aplicable. Far Cry 3 usa completitud; fuera de Steam no se muestran cromos. El vacío ofrece “Registrar mi progreso” y abre el diálogo existente. No se han cambiado APIs, reglas Golden ni datos.

## Comparison history

1. P2 detectado durante la primera captura: una regla anterior conservaba la cabecera del grupo en una columna lateral y restaba área al bento. Corregido con `grid-template-columns: minmax(0, 1fr)` en `.data-group-card`. La captura final muestra la cabecera encima de las celdas.
2. P2 detectado en la inspección de capas: el selector genérico del fondo situaba la atmósfera al mismo z-index que el contenido. Corregido con `.game-page-rich.is-golden > .game-golden-atmosphere`. Verificado z-index 0 de atmósfera frente a 1 en Detalles.
3. Comparación posterior: `.codex-qa/golden-bento-comparison.png` y capturas de posiciones opuestas confirman la jerarquía, legibilidad y geometría estable. Sin otros P0/P1/P2 en la comparación de pastillas.
4. Los bloqueos del controlador anterior de Chromium y los permisos de lectura del sandbox fueron incidencias del entorno, no se clasificaron como fallos de producto. Playwright directo y build autorizado completaron la validación.

## Interaction and validation

- Playwright: `.codex-qa/verify-golden-final.mjs`; resultado `.codex-qa/golden-final-results.json`, `passed: true`, sin errores de página observados.
- Golden por logros: Marvel Rivals; Golden por partidas al 100 %: Far Cry 3; parcial no Golden: MiSide; vacío no Golden: Firewatch. Todos comprobados en escritorio y móvil, sin overflow horizontal ni de celdas.
- El movimiento cambia posición y ángulo de los haces; el bounding box de los datos permanece idéntico entre posiciones opuestas del puntero.
- Diálogo de datos, acción de vacío, acordeón técnico y editor de App ID abren y cierran con Escape. No se pulsó Guardar. La atmósfera deja de seguir el puntero mientras hay un diálogo abierto.
- `prefers-reduced-motion` y táctil: sin reflejo dinámico ni transformación de la card; se conserva la identidad Golden estática. Una única card puede tener tracking.
- Pastillas: altura 26 px, texto 10 px, PC y Steam con el mismo neutro. Hover: escala próxima a 1.10, z-index 20 y portada sin transform propio.
- Targets nuevos de edición/acción de 44 px y foco visible. No se declara una certificación WCAG ni una auditoría completa de contraste en esta iteración.
- `npm run test:detail`, `npm run test:catalog`, `npm run test:finance`: passed.
- `npm run build`: passed (Astro/Vercel, 7.72 s en la última ejecución); `git diff --check`: passed. La extracción mecánica de las pastillas a `src/styles/card-badges.css` también se validó repitiendo todos los checks de Playwright, sin cambios visuales.

## Implementation checklist

- [x] Zoom de card completa de 1.06 a 1.10 sin tocar la inclinación aprobada.
- [x] Pastillas sutiles aprobadas limitadas al catálogo.
- [x] Fondo Golden coherente con el puntero y por debajo de los datos.
- [x] Bento Detalles asimétrico, responsive y sensible a estados de datos.
- [x] Preservar Horas, Dinero, APIs y cambios ajenos del repositorio.
- [x] Comparación visual, interacciones, fallbacks, regresiones y build.

## Follow-up polish

- P3 opcional: calibrar la intensidad del reflejo de fondo tras usarlo con el monitor y ratón habituales del usuario. No queda trabajo obligatorio de esta entrega pendiente por ese ajuste subjetivo.

final result: passed

---

# Histórico — Game Cards · frost y foil dinámico (validación anterior)

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
