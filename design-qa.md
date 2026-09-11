# Design QA — Bento Horas, Modos y Golden ultrawide · 2026-09-11

## Findings

No quedan diferencias P0/P1/P2 accionables en el alcance revisado. Se continúa el sistema de marca de la auditoría en Horas y Modos, y se corrige el fondo Golden. No se declara terminada la migración visual de toda la web. Dinero, APIs, cálculos económicos y datos guardados permanecen fuera de este cambio.

## Comparison target and evidence

- Fuente normativa: `DESIGN-STANDARDIZATION-AUDIT.md`, §5.4, y `src/styles/theme.css`. Prevalecen los tokens operativos, sin introducir migraciones futuras.
- Referencia aprobada: `docs/design-standardization/assets/47-game-detail-bento-data-states-proposed.png` (1536 × 1024). Se adapta su jerarquía bento y reflujo por datos; no se copian los valores ficticios del tablero ni se reproduce la sección Dinero.
- Incidencias aportadas por el usuario: `C:/Users/heroy/AppData/Local/Temp/codex-clipboard-647ece23-b64c-4c04-9a40-b5d017c76e85.png` (Modos) y `codex-clipboard-2307a8cd-f22b-4c8f-8b1c-0afe6ee1941c.png` (Horas). Documentan el estado anterior, no un objetivo de reproducción literal.
- Comparación conjunta inspeccionada: `.codex-qa/hours-brand-comparison.png` (1680 × 2283), fuente aprobada, antes y después, recurrentes, HLTB, estimadas y móvil. Capturas reducidas proporcionalmente; el wrapping y los valores se revisaron también a resolución nativa.
- Comparación conjunta del material: `.codex-qa/golden-field-comparison.png`, card real y tres posiciones del puntero a 3440 × 1440. Las capturas finales del centro muestran el reflejo a través del marco, nunca sobre las celdas de datos.
- Chromium con Playwright directo, autorizado por el usuario. Rutas locales: `/games/marvel-rivals/`, `/games/league-of-legends/`, `/games/miside/`, `/games/firewatch/`, `/games/valorant/`, `/games/wolfenstein-the-new-order/`, `/games/far-cry-3/` y catálogo `/?golden=true`.
- Viewports: 1440 × 1024, 820 × 1180, 390 × 844, 320 × 844, 3440 × 1440 y 5120 × 1440; deviceScaleFactor 1. Fallback táctil probado además con contexto iPhone 12.
- Los datos locales difieren de algunas capturas de producción del usuario (fechas y gasto). No se han reconciliado ni cambiado: esta entrega modifica presentación, no la fuente de datos. Los estados descritos son los reales del entorno comprobado.
- Evidencia y scripts en `.codex-qa/` son recursos locales ignorados por Git; este informe sí queda versionado.

## Required fidelity surfaces

- Fonts and typography: se mantienen las familias de marca. Horas reales dominan con tamaño adaptable; meta y fechas tienen escalas subordinadas. Las duraciones usan el mismo formateador que el resto del producto. La etiqueta larga de horas estimadas se divide en dos líneas en gráficas estrechas.
- Spacing and layout rhythm: bento de 12 columnas, cifra principal 7/12 y apoyos 5/12, gaps de 12 px y separación de 16 px antes de la gráfica. Radios 32/16/8 px. Los recurrentes sin HLTB usan dos apoyos; los demás estados conservan Fin y reorganizan las celdas sin huecos artificiales. Móvil apila las métricas y mantiene fechas en dos columnas.
- Colors and tokens: blanco cálido `--text`, violeta `--theme-purple`, superficies `--detail-bento-*` y bordes sobrios. Comparativa con horas personales violetas, referencias neutras y amortización dorada. El marco Golden deja pasar luz mediante `--detail-golden-surface`; las celdas internas siguen opacas.
- Image quality and assets: portada original, iconos Tabler y fuentes existentes. `golden-material.css` comparte literalmente bandas diagonales y grano fino entre catálogo y ficha. No hay raster nuevo, blur sobre la portada ni zoom independiente de imagen.
- Copy and content: se distinguen cero (`0 min`), vacío (`Sin registrar`) y estimación (`≈` y etiqueta explícita). No se muestran HLTB ni Fin en recurrentes; la aplicabilidad competitiva sigue las reglas existentes. Sin referencias no se deja una gráfica vacía. Los tres modos se presentan como lista de pastillas neutras, conservando todos los valores.

## Comparison history

1. P2 anterior: Periodo no llenaba su columna, el bloque de gráfica tocaba la fila superior y los estilos de Horas no seguían el bento aprobado. Corregidos retícula, gaps, superficies, jerarquía y escalas.
2. P2 anterior: los recurrentes seguían mostrando el desglose HLTB aunque sus objetivos no eran aplicables. El desglose ahora respeta la misma aplicabilidad que la meta y las barras.
3. Se cambió la comparativa a barras horizontales con valores directos y eje desde cero. Los datos de partida y las fórmulas permanecen iguales; no se fuerza una interpretación económica nueva.
4. P2 detectado en revisión nativa a 320 px: “Horas estimadas” se cortaba en el canvas. Corregido con wrapping; captura final `.codex-qa/hours-far-cry-3-320.png` revisada completa.
5. P2 anterior del fondo: el material se estiraba con el viewport y apenas se percibía en ultrawide. Ahora el centro sigue al puntero en píxeles y el campo mantiene un máximo de 1100 × 960 px.
6. Ajuste tras comparación central: el fondo quedaba completamente tapado por el marco opaco. Se permite luz solo en la superficie exterior (82 % de opacidad de base), conservando opacos los datos y la gráfica. La geometría permanece idéntica al mover el ratón.
7. La primera compilación detectó que el formateador de horas arrastraba dependencias de servidor al cliente. Se extrajo a `game-duration.ts`, manteniendo su exportación anterior y su comportamiento. La compilación final y las pruebas financieras pasan.

## Interaction and validation

- `.codex-qa/verify-hours-golden.mjs` y `hours-golden-results.json`: passed. Escritorio, tablet, móvil, Golden, card de catálogo, diálogo y fallbacks.
- `.codex-qa/verify-hours-states.mjs` y `hours-edge-results.json`: passed. Valorant vacío sin gráfica, Wolfenstein cero, Far Cry 3 estimado y tres modos; 1440, 390 y 320 px, sin overflow horizontal ni de celdas.
- Golden a 3440 y 5120 px: centro del campo coincide con el puntero con tolerancia de 2 px; ancho 1100 y alto 960 constantes. Posiciones opuestas y centro comprobados; bounding box de Horas sin cambios.
- Se conserva desactivación al salir, cambiar de ventana, abrir diálogo o usar movimiento reducido/táctil. Transición de salida 260 ms. Ningún efecto automático. Las superficies decorativas no interceptan clics.
- Catálogo: mismo material compartido, tracking y portada con `transform: none`; no se cambian el zoom o la inclinación aprobados.
- Editor de Horas abierto y cerrado con Escape; no se guardó ningún formulario. No se modificaron APIs ni se enviaron escrituras de datos.
- Los canvas tienen etiqueta accesible con todos los valores; controles de edición de 44 px y foco visible. No se declara certificación WCAG ni una auditoría de accesibilidad integral.
- Cero errores de página observados en las pruebas de navegador.
- `npm run test:detail`, `npm run test:finance`, `npm run test:catalog`: passed. Casos añadidos para cero, null, estimadas, referencias inválidas y ausencia de mutación del payload.
- `npm run build`: passed (Astro/Vercel, 6.91 s en la última compilación). `git diff --check`: passed.

## Implementation checklist

- [x] Aplicar el bento de marca a Horas, conservando estados reales de datos.
- [x] Mantener todas las variables relevantes y la comparativa, sin placeholders de gráficas vacías.
- [x] Separar Modos en pastillas sutiles sin separadores huérfanos.
- [x] Compartir material diagonal entre card y fondo Golden y seguir al puntero en ultrawide.
- [x] Mantener datos legibles, geometría estable y fallbacks accesibles.
- [x] Revisar comparaciones conjuntas y capturas nativas, tests y build.
- [x] Excluir de la entrega las modificaciones preexistentes de `games.json`, `AGENTS.md` y otros artefactos.

## Follow-up polish

- P3 opcional: calibrar intensidad percibida en el monitor ultrawide físico del usuario. Se ha comprobado geometría y resultado visual en Chromium a las resoluciones indicadas; no se ha medido brillo del panel físico ni rendimiento en hardware de baja gama.

final result: passed

---

# Histórico — Golden en ficha, bento Detalles y pastillas · 2026-09-11

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
