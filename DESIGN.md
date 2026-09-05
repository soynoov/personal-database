# NooVDB — Visual & Motion System

Estado: borrador de dirección visual 2.0

Última revisión: 2026-09-05

Nombre de marca: **NooVDB**

Descriptor: **Personal Database**

El documento se vuelve normativo cuando se selecciona uno de los mockups de catálogo. Hasta entonces fija la marca, los tokens y las reglas de composición, pero deja abierta la densidad final de la página.

## 0. Alcance

Este archivo define la identidad visual y el sistema de composición de NooVDB. La aplicación es una herramienta privada, de una sola persona, centrada en explorar una biblioteca personal de videojuegos.

Quedan fuera de alcance:

- SEO, indexación y contenido para buscadores;
- conformidad formal WCAG o auditorías de accesibilidad;
- marketing, conversión y patrones de SaaS genérico;
- cambios de funcionalidad o de modelo de datos;
- rediseñar la aplicación antes de aprobar una dirección mediante mockups.

Se mantiene una operabilidad básica porque también mejora el uso personal: HTML correcto, controles reconocibles, foco visible, labels claros, estados de interacción y ninguna acción esencial disponible únicamente mediante hover.

## 1. Decisión de marca

NooVDB debe sentirse como un archivo digital diseñado por un estudio creativo: oscuro, editorial, táctil y en movimiento.

La fórmula de marca es:

> Archivo nocturno + violeta eléctrico + vidrio escarchado + tipografía display expresiva + portadas protagonistas.

Las cards del catálogo son la pieza canónica. El resto de la interfaz debe parecer construido con la misma materia, pero no todo debe convertirse en una card.

### 1.1 Personalidad

- **Nocturna:** lienzo casi negro con profundidad violeta, nunca gris administrativo.
- **Eléctrica:** el violeta firma acciones, selección y movimiento.
- **Editorial:** titulares grandes y expresivos, composición con tensión y espacio.
- **Táctil:** vidrio, reflejos finos, grano y capas que reaccionan al puntero.
- **Coleccionista:** las portadas y los datos personales dominan sobre el chrome.
- **Precisa:** aunque la expresión sea fuerte, medidas, variantes y comportamiento están estandarizados.

### 1.2 Lo que NooVDB no debe parecer

- un dashboard corporativo azul;
- una plantilla de administración con una caja alrededor de cada dato;
- una interfaz gamer basada en neón continuo, bordes brillantes y ruido visual;
- glassmorphism aplicado a todos los niveles;
- una landing page promocional;
- un collage de estilos distintos por página.

## 2. Referencias y criterio de selección

Las referencias aportadas fijan estos rasgos:

- fondos `Midnight Blue`, `Deep Graphite` y `Night`;
- violetas `True Violet`, `Neon Purple` y `Electric Purple`;
- blanco frío como contraste principal;
- magenta y amarillo como golpes gráficos breves;
- tipografía display pesada, redondeada o condensada;
- composición de estudio creativo: escala extrema, bloques limpios y asimetría controlada.

No se copiará una referencia de forma literal. Se combinará su lenguaje con la estructura actual de NooVDB y con la card vertical de catálogo.

## 3. Principios

### 3.1 Las portadas son el color principal

El chrome permanece oscuro y controlado. Las portadas pueden ser multicolor y deben conservar la mayor superficie visual de la card.

### 3.2 Una escena, un gesto eléctrico

Cada pantalla tiene un único gesto dominante: un campo violeta, un titular, una selección o una transición. Magenta y amarillo no compiten simultáneamente por protagonismo.

### 3.3 El vidrio aparece donde existe profundidad

El frosted glass se usa cuando una superficie flota sobre portadas, luz ambiental o contenido desplazable. Una caja sobre un fondo plano usa superficie sólida.

### 3.4 Del widget pequeño al grande

La coherencia se construye por composición. Los widgets grandes sólo ensamblan widgets menores y tokens compartidos; no inventan una paleta, radio o animación propios.

### 3.5 Motion explica la interfaz

La animación muestra continuidad, selección, jerarquía o profundidad. Si una animación no explica nada, se elimina.

### 3.6 Responsive recompone, no redecora

Desktop, tablet y móvil comparten tipografía, materiales, color y comportamiento. Sólo cambian rejilla, orden, densidad y navegación.

## 4. Paleta

### 4.1 Colores de referencia

| Nombre | Valor | Papel |
|---|---:|---|
| Night Ink | `#0a0712` | lienzo operativo |
| Deep Plum | `#11012e` | profundidad violeta |
| Deep Graphite | `#171717` | superficie sólida |
| Midnight Blue | `#1e1e2f` | materia del vidrio |
| Deep Violet | `#2a0c62` | campo de profundidad |
| True Violet | `#5521f1` | extremo oscuro del violeta |
| Neon Purple | `#8a2be2` | acción y selección |
| Electric Purple | `#c200fb` | energía y glow |
| Hot Magenta | `#ff018f` | señal especial |
| Signal Yellow | `#ffcc00` | alerta o golpe editorial |
| Ice White | `#f4f6fc` | texto principal |

### 4.2 Tokens operativos

Todos los componentes consumen tokens. Ningún componente de página introduce colores literales.

```css
:root {
  /* Brand source */
  --brand-night: #0a0712;
  --brand-plum: #11012e;
  --brand-graphite: #171717;
  --brand-midnight: #1e1e2f;
  --brand-violet-depth: #2a0c62;
  --brand-violet-deep: #5521f1;
  --brand-violet: #8a2be2;
  --brand-electric: #c200fb;
  --brand-magenta: #ff018f;
  --brand-yellow: #ffcc00;
  --brand-ice: #f4f6fc;

  /* Canvas and solid surfaces */
  --ds-canvas: var(--brand-night);
  --ds-canvas-depth: var(--brand-plum);
  --ds-surface-solid: var(--brand-graphite);
  --ds-surface-raised: #211d2b;

  /* Frosted surfaces */
  --ds-glass-soft: rgba(30, 30, 47, 0.42);
  --ds-glass-default: rgba(30, 30, 47, 0.64);
  --ds-glass-dense: rgba(23, 23, 23, 0.82);
  --ds-glass-overlay: rgba(10, 7, 18, 0.72);

  /* Lines and highlights */
  --ds-line-soft: rgba(244, 246, 252, 0.10);
  --ds-line-default: rgba(244, 246, 252, 0.16);
  --ds-line-lit: rgba(194, 0, 251, 0.48);
  --ds-highlight-glass: rgba(244, 246, 252, 0.18);

  /* Text */
  --ds-text-primary: var(--brand-ice);
  --ds-text-secondary: rgba(244, 246, 252, 0.72);
  --ds-text-muted: rgba(244, 246, 252, 0.48);
  --ds-text-disabled: rgba(244, 246, 252, 0.28);

  /* Brand interaction */
  --ds-action-primary: var(--brand-violet);
  --ds-action-primary-hover: var(--brand-electric);
  --ds-on-primary: var(--brand-night);
  --ds-selection: rgba(138, 43, 226, 0.22);
  --ds-focus: var(--brand-electric);

  /* Semantic signals: small-area use only */
  --ds-success: #76e096;
  --ds-info: #78b7ff;
  --ds-warning: var(--brand-yellow);
  --ds-danger: #ff4d6d;
  --ds-special: var(--brand-magenta);

  /* Shared ambient fields */
  --ds-ambient-main:
    radial-gradient(circle at 72% 12%, rgba(194, 0, 251, 0.20), transparent 38%),
    radial-gradient(circle at 14% 84%, rgba(85, 33, 241, 0.14), transparent 42%);
  --ds-ambient-hot:
    radial-gradient(circle at 80% 18%, rgba(255, 1, 143, 0.10), transparent 34%);
}
```

### 4.3 Distribución visual

- 70–80%: lienzo y superficies nocturnas.
- 15–25%: portadas, texto y datos.
- 3–6%: violeta de interacción.
- menos del 2%: magenta, amarillo o estados semánticos.

### 4.4 Reglas de color

- `Neon Purple` es la acción principal y la selección habitual.
- `Electric Purple` se reserva para foco, hover intenso, glow y momentos de motion.
- `True Violet` y `Deep Violet` construyen profundidad; no se usan como nuevos estados.
- El botón primario es violeta sólido con texto `--ds-on-primary`; no lleva texto claro sobre un degradado variable.
- Magenta identifica elementos especiales o de colección. Amarillo indica atención o acento editorial.
- Magenta y amarillo no aparecen juntos como dos acciones equivalentes.
- Los colores semánticos ocupan dots, badges, tramos de gráfico o mensajes; no tiñen paneles completos.
- Launcher y plataforma son metadatos neutrales.

## 5. Tipografía

### 5.1 Decisión

La display principal será **Caacupé** —nombre de familia CSS: `Caacupe`—. Su trazo pesado, condensado y con raíz de rotulación encaja mejor con el catálogo que Modak y deja más espacio a las portadas.

**Modak no forma parte del sistema activo.** Puede explorarse en el futuro para un sello de una sola palabra, pero mezclar ambas display debilitaría la estandarización.

La interfaz y los datos usan **Geist Sans**. Ambas fuentes activas se servirán localmente en formato `woff2` cuando empiece la implementación. Caacupé y Modak están disponibles bajo SIL Open Font License; la licencia correspondiente debe conservarse junto a cada fuente instalada.

```css
:root {
  --ds-font-display: "Caacupe", "Arial Narrow", sans-serif;
  --ds-font-ui: "Geist Sans", "Inter", system-ui, sans-serif;

  --ds-type-micro: 11px;
  --ds-type-label: 12px;
  --ds-type-ui: 14px;
  --ds-type-body: 16px;
  --ds-type-card: 20px;
  --ds-type-section: 28px;
  --ds-type-page: clamp(48px, 6vw, 88px);
  --ds-type-marquee: clamp(72px, 10vw, 144px);

  --ds-leading-tight: 0.88;
  --ds-leading-title: 1;
  --ds-leading-ui: 1.25;
  --ds-leading-body: 1.5;

  --ds-track-tight: -0.035em;
  --ds-track-ui: -0.01em;
  --ds-track-label: 0.10em;
}
```

| Rol | Fuente | Tamaño | Peso | Uso |
|---|---|---:|---:|---|
| Marquee | Caacupé | `--ds-type-marquee` | único peso | palabra o cifra expresiva |
| Page title | Caacupé | `--ds-type-page` | único peso | título principal |
| Section title | Geist Sans | 28px | 700 | bloque de contenido |
| Card title | Geist Sans | 20px | 700 | nombre de juego |
| Body | Geist Sans | 16px | 400 | texto general |
| UI | Geist Sans | 14px | 600 | controles |
| Label | Geist Sans | 12px | 650 | badge y etiqueta |
| Micro | Geist Sans | 11px | 500 | metadato secundario breve |

Reglas:

- Caacupé se usa en fragmentos breves: máximo dos líneas y nunca en párrafos, formularios o badges.
- Un título display puede ser enorme; no se compensa llenando alrededor de cajas pequeñas.
- Las mayúsculas se reservan para display, eyebrow y etiquetas breves.
- Números y métricas usan Geist Sans con cifras tabulares.
- No se añaden tamaños, pesos, line-height o tracking fuera de los tokens.

## 6. Escala espacial y geometría

```css
:root {
  --ds-space-1: 4px;
  --ds-space-2: 8px;
  --ds-space-3: 12px;
  --ds-space-4: 16px;
  --ds-space-5: 20px;
  --ds-space-6: 24px;
  --ds-space-8: 32px;
  --ds-space-10: 40px;
  --ds-space-12: 48px;
  --ds-space-16: 64px;
  --ds-space-24: 96px;

  --ds-radius-control: 12px;
  --ds-radius-widget: 18px;
  --ds-radius-feature: 26px;
  --ds-radius-hero: 36px;
  --ds-radius-pill: 999px;

  --ds-control-sm: 32px;
  --ds-control-md: 40px;
  --ds-control-touch: 44px;
}
```

- La rejilla base es de 4 px.
- Un nivel anidado reduce radio: hero 36 → feature 26 → widget 18 → control 12.
- No se corrige una composición con valores arbitrarios como `13px`, `17px` o `0.85rem`.
- Desktop usa controles de 40 px. En dispositivos con puntero grueso se usa 44 px, con independencia del ancho de pantalla.

## 7. Materiales y profundidad

### 7.1 Capas

| Nivel | Nombre | Material | Uso |
|---:|---|---|---|
| 0 | Canvas | mate | fondo global y campo ambiental |
| 1 | Solid | grafito | contenido estable y zonas densas |
| 2 | Frost | vidrio medio | navegación, filtros flotantes y widgets sobre profundidad |
| 3 | Overlay | vidrio denso | card sobre portada, menú y diálogo |

### 7.2 Receta frosted

```css
:root {
  --ds-blur-soft: 14px;
  --ds-blur-default: 22px;
  --ds-blur-overlay: 30px;
  --ds-shadow-float: 0 24px 70px rgba(0, 0, 0, 0.38);
  --ds-shadow-card: 0 18px 46px rgba(0, 0, 0, 0.30);
  --ds-glow-violet: 0 0 42px rgba(194, 0, 251, 0.22);
}
```

Un frost completo combina:

1. un solo fondo translúcido;
2. blur del nivel correspondiente;
3. borde exterior fino;
4. highlight superior o interior muy sutil;
5. sombra exterior sólo si realmente flota;
6. grano monocromo de 1–2% aplicado a la escena, no repetido por widget.

Reglas:

- Nunca hay vidrio dentro de vidrio con ambos bordes visibles.
- Un widget plano dentro de un frost usa transparencia y separación, no otra caja.
- El blur no reemplaza una buena jerarquía.
- El glow sólo aparece en selección, foco o una pieza protagonista.
- No combinar en el mismo widget dos sombras, blur fuerte, gradiente de borde y glow.

## 8. Arquitectura de widgets Astro

### 8.1 Escalera de composición

| Nivel | Tipo | Ejemplos |
|---:|---|---|
| 0 | Token | color, tipo, espacio, radio, motion |
| 1 | Micro-widget | `StatusDot`, `Badge`, `IconButton`, `MiniMetric` |
| 2 | Control widget | `Button`, `FilterChip`, `SearchField`, `Select`, `DateValue` |
| 3 | Content widget | `GameCard`, `MetricCard`, `TimelineItem`, `ProgressCard` |
| 4 | Feature widget | `FilterDock`, `StatsStrip`, `FinanceSummary`, `RoulettePanel` |
| 5 | Scene | catálogo, ficha, estadísticas, ruleta |

Un nivel sólo puede componer elementos de su mismo nivel o inferiores. Una `Scene` decide layout; no redefine internamente el aspecto de cada widget.

### 8.2 Estructura objetivo

```text
src/
  components/
    ui/
      Badge.astro
      Button.astro
      DatePill.astro
      DateRange.astro
      DateValue.astro
      EmptyState.astro
      FormField.astro
      IconButton.astro
      Metric.astro
      ProgressBar.astro
      SectionHeader.astro
      Select.astro
      WidgetFrame.astro
    catalog/
      CatalogGameCard.astro
      FilterDock.astro
    game/
      GameFinanceSummary.astro
      GameStatusBadge.astro
  lib/
    formatters.ts
  scripts/
    motion/
      init-motion.ts
      presets.ts
  styles/
    tokens.css
    motion.css
    widgets.css
```

No es una orden para crear archivos en esta fase. Es el contrato para la implementación posterior.

### 8.3 `WidgetFrame.astro`

Responsabilidad: aplicar material, padding y radio; nunca comportamiento interactivo.

```ts
type Props = {
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav';
  material?: 'solid' | 'frost' | 'overlay';
  radius?: 'control' | 'widget' | 'feature' | 'hero';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};
```

No acepta colores, blur, sombras, radios arbitrarios ni `interactive`. Si algo es accionable, se implementa con un enlace o botón real.

### 8.4 `Button.astro`

Enlaces y acciones usan una unión discriminada para evitar combinaciones inválidas.

```ts
type VisualProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'touch';
  iconStart?: string;
  iconEnd?: string;
  loading?: boolean;
};

type ButtonProps = VisualProps & (
  | { href: string; type?: never; disabled?: never }
  | { href?: never; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }
);
```

- Primary: una acción dominante por feature widget.
- Secondary: acción normal.
- Ghost: navegación o acción de baja prioridad.
- Danger: sólo acción destructiva.
- Un enlace desactivado debe dejar de ser enlace o gestionar explícitamente `aria-disabled` y bloqueo de activación.

### 8.5 `Badge` y `FilterChip`

`Badge` es informativo. `FilterChip` es interactivo. No comparten semántica aunque visualmente sean compactos.

```ts
type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'special';
```

`GameStatusBadge` llama siempre a `normalizeStatus()` antes de comparar `estado`. Un valor desconocido usa tono neutral y conserva su texto; nunca inventa una categoría.

### 8.6 Fechas

Una fecha civil y un instante no son el mismo dato:

- `calendar`: cadena ISO `YYYY-MM-DD`, formateada sin convertirla a UTC;
- `instant`: ISO completo con zona u offset, formateado en la zona indicada;
- nunca se usa un `Date` ambiguo como fuente de verdad para una fecha civil.

```ts
type DateValueProps = {
  value: string | null | undefined;
  kind?: 'calendar' | 'instant';
  format?: 'compact' | 'medium' | 'long';
  locale?: 'es-ES';
  timeZone?: string;
  fallback?: string;
  showIcon?: boolean;
};
```

El fallback por defecto es `Sin registrar`. Un wrapper de dominio puede usar un mensaje más preciso, como `Sin finalizar`. `DateRange` compone dos `DateValue`; ninguna página concatena fechas formateadas.

### 8.7 Métricas

`Metric` recibe datos crudos y decide su presentación. No acepta una cifra preformateada como sustituto del dato.

```ts
type MetricProps = {
  label: string;
  value: number | null;
  kind?: 'number' | 'currency' | 'duration' | 'percentage';
  currency?: 'EUR';
  precision?: 0 | 1 | 2;
  supportingText?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'special';
  icon?: string;
};
```

Las fórmulas viven en `src/lib/`; el formato vive en `Metric` o en `formatters.ts`. Una string sólo se admite mediante una prop separada `displayValue` cuando el contenido no es realmente numérico.

### 8.8 Progreso

`ProgressBar` usa `<progress value max>` siempre que represente progreso real. Admite `value`, `max`, label, texto visible y estado indeterminado. No se recrea con un `div` y un único `aria-valuenow`.

## 9. Card canónica de catálogo

La card es el centro de gravedad de NooVDB.

### 9.1 Anatomía

1. portada vertical, ratio aproximado 2:3;
2. overlay frosted inferior que ocupa sólo lo necesario;
3. título del juego;
4. launcher/plataforma como metadato neutral;
5. estado compacto;
6. una métrica principal;
7. metadato secundario opcional;
8. acción contextual discreta.

### 9.2 Jerarquía

- La imagen ocupa como mínimo dos tercios de la superficie visible inicial.
- El título y la métrica principal dominan el overlay.
- El estado es pequeño y no compite con la portada.
- Nunca se añaden más de dos filas de metadatos en reposo.
- La card completa puede ser un enlace; las acciones internas deben evitar zonas de click anidadas inválidas.

### 9.3 Estado de interacción

- elevación máxima: `translateY(-8px)`;
- zoom de portada: máximo 3.5%;
- tilt por puntero: máximo 1.5 grados;
- borde o halo violeta localizado, no marco de neón completo;
- el overlay gana ligeramente densidad y puede revelar una sola línea adicional;
- la información esencial ya es visible antes de hover.

### 9.4 Variantes permitidas

- `standard`: card principal del grid;
- `compact`: menos metadatos, misma proporción;
- `featured`: mayor escala y tratamiento editorial, misma anatomía;
- `mobile`: composición vertical o apaisada definida por el contenedor, mismos tokens.

No existen variantes por página que cambien colores, radios o tipografía.

## 10. Patrones de escena

### 10.1 Catálogo

- Sidebar o rail flotante frosted.
- Titular editorial grande, sin encerrarlo necesariamente en una card.
- `StatsStrip` como secuencia de micro-widgets.
- `FilterDock` compacto y desplegable; los filtros avanzados no ocupan permanentemente media pantalla.
- Grid de cards como masa visual principal.
- Campo ambiental violeta detrás del contenido, nunca por encima de las portadas.

### 10.2 Ficha

- Hero de portada y título como feature widget.
- Datos divididos por ritmo y alineación antes que por cajas.
- Finanzas, progreso y sesiones componen widgets menores.
- Máximo un contenedor visible dentro de otro.

### 10.3 Estadísticas

- El gráfico es protagonista; las métricas lo apoyan.
- No asignar un color decorativo distinto a cada número.
- El violeta identifica selección o serie principal; los demás colores son funcionales.

### 10.4 Ruleta

- La rueda es el gesto visual único.
- Formulario y resultado se subordinan a ella.
- El glow puede intensificarse durante el giro y disiparse al detenerse.

### 10.5 Navegación

- Una sidebar desktop y una navegación móvil compartidas por todas las escenas.
- Logo, orden, iconos, espaciado y estado activo no cambian por página.
- El estado activo combina materia, forma y una línea de luz; no depende de rellenar todo el botón de violeta.

## 11. Motion system con GSAP

GSAP será el motor para secuencias, stagger, profundidad y transiciones coordinadas. CSS permanece para cambios simples de color y borde.

### 11.1 Tokens de tiempo

```css
:root {
  --ds-motion-instant: 100ms;
  --ds-motion-fast: 160ms;
  --ds-motion-base: 260ms;
  --ds-motion-reveal: 520ms;
  --ds-motion-scene: 820ms;
}
```

Curvas GSAP aprobadas:

- microinteracción: `power2.out`;
- card y widget: `power3.out`;
- reveal editorial: `expo.out`;
- reorganización: `power2.inOut`;
- rebote: `back.out(1.35)`, sólo en un resultado o confirmación.

### 11.2 Presets

| Preset | Uso | Movimiento |
|---|---|---|
| `scene-enter` | entrada de página | fade + y 20 px, 520–820 ms |
| `title-reveal` | titular Caacupé | máscara vertical y tracking, 520 ms |
| `widget-stagger` | grupos | y 14 px, stagger 35–55 ms |
| `card-enter` | grid | escala 0.985 + y 18 px, stagger por filas |
| `card-hover` | card activa | y, zoom, tilt y halo contenidos |
| `frost-settle` | overlay | blur y opacidad hasta material estable |
| `selection-pulse` | selección | un pulso de luz, sin loop |
| `ambient-drift` | fondo | deriva lenta de 8–14 s, una capa por escena |

### 11.3 Contrato técnico futuro

- Los componentes renderizan `data-motion` y no crean timelines arbitrarias.
- `src/scripts/motion/presets.ts` es la única fuente de duraciones, eases y distancias GSAP.
- Cada inicializador usa `gsap.context()` con scope local y devuelve cleanup.
- `gsap.matchMedia()` controla desktop, móvil, puntero y preferencia de movimiento.
- Una navegación o desmontaje revierte contextos, ScrollTriggers y listeners.
- `ScrollTrigger` se usa sólo cuando el scroll es parte real de la narración.
- Las animaciones de hover deben poder interrumpirse y revertirse sin saltos.
- Se priorizan `transform` y `opacity`; no se anima layout completo.

### 11.4 Límites

- Una escena puede tener un solo loop ambiental.
- No hay partículas constantes, cursor personalizado ni texto flotante por defecto.
- No usar `transition: all`.
- No animar todas las cards al hacer cualquier cambio de filtro; sólo entradas, salidas y reordenación necesarias.
- Si motion reduce claridad o hace lenta una acción repetida, se recorta antes de añadir más efectos.

## 12. Responsive y operabilidad personal

Viewports de revisión:

- móvil: 390 × 844;
- tablet: 820 × 1180;
- desktop: 1440 × 1024;
- desktop ancho: 1728 × 1117, sólo para comprobar expansión del grid.

Reglas:

- El grid usa `minmax()` y un ancho máximo de card; las cards no se estiran hasta deformarse.
- El título display reduce escala o cambia de línea, pero conserva personalidad.
- La sidebar se convierte en navegación móvil, no en una mini-sidebar comprimida.
- Los filtros avanzados se convierten en drawer o sheet.
- Las acciones frecuentes siguen visibles; las secundarias pueden entrar en menú.
- Hover mejora, nunca desbloquea, información esencial.
- Se conserva foco visible y semántica nativa en enlaces, botones, inputs y progreso.
- `prefers-reduced-motion` desactiva loops, tilt y grandes desplazamientos aunque no sea un objetivo formal de conformidad.

## 13. Reglas de implementación

1. No tocar la interfaz hasta aprobar un mockup visual.
2. Todos los valores visuales salen de `tokens.css` o de datos dinámicos reales.
3. No añadir colores literales en hex, rgb, hsl o nombres CSS fuera de tokens.
4. No usar `!important`.
5. No usar `transition: all`.
6. No añadir otra familia de iconos: se mantiene Tabler Icons.
7. No usar emoji o SVG manual cuando exista un icono Tabler equivalente.
8. Páginas Astro orquestan; widgets renderizan; `src/lib/` calcula; `src/scripts/motion/` anima.
9. No mezclar `define:vars` con imports de módulos; el servidor pasa datos mediante `data-*`.
10. `normalizeStatus()` se ejecuta antes de comparar estados.
11. Fechas, dinero, duración y porcentajes no se formatean directamente en páginas.
12. Un componente base no acepta colores, radios, sombras o blur arbitrarios.
13. Una variante base debe resolver al menos dos casos reales; si sólo resuelve uno, pertenece al dominio.
14. Todo archivo se mantiene por debajo de 1000 líneas.
15. Cada cambio visual se compara en 390, 820 y 1440 px antes de migrar otra escena.

## 14. Inventario visual

La futura ruta interna `/design-system` será privada y no formará parte de navegación normal. Debe mostrar:

- paleta y materiales sobre fondos reales;
- escala tipográfica completa;
- cada micro-widget, control y content widget;
- variantes `default`, `hover`, `active`, `selected`, `loading`, `disabled`, `error` y `empty` cuando correspondan;
- presets de motion con controles para reproducir y detener;
- composición desktop, tablet y móvil;
- datos reales o anonimizados de NooVDB, nunca información sensible.

## 15. Migración recomendada

### Fase 0 — Cerrar la dirección

1. Elegir un mockup de catálogo.
2. Ajustarlo hasta que paleta, tipo, frost, densidad y cards queden aprobados.
3. Cambiar el estado de este documento a `Normativo 2.0`.

### Fase 1 — Fundamentos

1. Crear `tokens.css` con aliases temporales.
2. Autohospedar Caacupé y Geist Sans.
3. Crear el registro de presets GSAP.
4. Añadir una comprobación que impida nuevos valores visuales crudos.

### Fase 2 — Del widget pequeño al grande

1. `Badge`, `StatusDot`, `IconButton` y `MiniMetric`.
2. `Button`, `FilterChip`, `DateValue`, `DatePill` y `DateRange`.
3. `WidgetFrame`, `Metric` y `ProgressBar`.
4. `CatalogGameCard` y `GameStatusBadge`.
5. `FilterDock`, `StatsStrip` y navegación compartida.
6. Escena completa de catálogo.

### Fase 3 — Validar el sistema

1. Construir `/design-system`.
2. Validar estados y motion.
3. Comparar catálogo real con el mockup seleccionado.
4. Ajustar tokens; no parchear componentes individuales.

### Fase 4 — Migrar escenas

1. Estadísticas.
2. Ruleta.
3. Ficha.
4. Pendientes y Metacrítica.

Cada escena se entrega y revisa de forma independiente. No se hace una reescritura global de CSS.

### Fase 5 — Retirar legacy

- eliminar aliases sin uso;
- consolidar CSS duplicado;
- retirar tratamientos visuales antiguos;
- mantener un changelog breve del sistema.

## 16. Criterios de aceptación

Una escena se considera migrada cuando:

- parece inequívocamente parte de NooVDB sin depender del nombre o logo;
- las portadas y datos siguen dominando al chrome;
- usa la escalera de widgets y no crea componentes monolíticos;
- no introduce valores visuales fuera de tokens;
- no supera dos contenedores visibles anidados;
- usa frost sólo cuando existe profundidad real;
- las cards respetan anatomía, proporción y motion canónicos;
- mantiene estados aplicables de hover, focus, active, selected, loading, disabled, error y empty;
- funciona en los viewports de revisión;
- limpia correctamente timelines y listeners;
- pasa build y comparación visual contra el mockup aprobado.

## 17. Brief de mockup para cerrar la dirección

El primer mockup representa el catálogo desktop a 1440 × 1024.

Debe mostrar:

- lienzo Night Ink con profundidad violeta;
- navegación frosted flotante;
- marca `NOOVDB` con descriptor `PERSONAL DATABASE`;
- título `CATÁLOGO` en display pesada estilo Caacupé;
- estadísticas como micro-widgets;
- filtros compactos;
- grid de cards verticales como protagonista;
- overlays frosted sobre las portadas;
- violeta eléctrico como acción y selección;
- como máximo un golpe magenta o amarillo por composición;
- indicios visuales de profundidad y motion sin convertir la captura en concept art.

Debe evitar:

- navegador o marco de dispositivo;
- landing page, hero comercial o copy promocional;
- paneles corporativos;
- cards dentro de cards;
- glow alrededor de todos los elementos;
- más controles de los necesarios para explorar la biblioteca;
- sacrificar tamaño de portada para enseñar muchas funciones.

La selección del mockup fijará tres decisiones todavía abiertas:

1. grid estrictamente regular frente a composición editorial con una card destacada;
2. sidebar completa frente a rail compacto;
3. cantidad exacta de metadatos visibles en reposo.

## 18. Referencias técnicas

- [Proyecto oficial de Caacupé](https://github.com/googlefonts/caacupe): origen, alcance latino y licencia OFL.
- [Proyecto oficial de Modak](https://github.com/EkType/Modak): alternativa display evaluada y licencia OFL.
- [Documentación oficial de `gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/): condiciones responsive y cleanup de animaciones.
