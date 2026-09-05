# NooVDB — Visual System

Estado: borrador de dirección visual 2.4

Última revisión: 2026-09-05

Nombre de marca: **NooVDB**

Descriptor: **Personal Database**

El documento se vuelve normativo cuando se aprueba el mockup de catálogo revisado. Hasta entonces fija la marca, los tokens y las reglas de composición sin autorizar cambios sobre la interfaz real.

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

NooVDB debe sentirse como la versión pulida por un estudio creativo de la interfaz que ya existe: oscura, editorial, táctil y muy contenida en movimiento.

La fórmula de marca es:

> Estructura actual + carbón casi negro + Purple dosificado + vidrio escarchado + tipografía display expresiva + portadas protagonistas.

Las cards del catálogo son la pieza canónica. El resto de la interfaz debe parecer construido con la misma materia, pero no todo debe convertirse en una card.

### 1.1 Personalidad

- **Nocturna:** lienzo carbón casi negro; el violeta aporta profundidad sólo en áreas pequeñas, nunca tiñe toda la pantalla.
- **Tonal:** `Purple` firma acciones, selección y estados excepcionales sin volver violeta el fondo.
- **Editorial:** titulares expresivos dentro de la jerarquía y la maqueta actuales.
- **Táctil:** vidrio, reflejos finos, grano y cards que reaccionan al puntero.
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

- `Dark #262626` como origen del lienzo y de las superficies;
- `Light #FFFFFF` como contraste principal;
- `Purple #9B59B6` como único color de marca;
- colores adicionales únicamente para estados semánticos y el foil excepcional;
- tipografía display pesada, redondeada o condensada;
- composición de estudio creativo: escala extrema, bloques limpios y asimetría controlada.

No se copiará una referencia de forma literal. Del mockup 3 se conservan el acabado nocturno, la tensión tipográfica y la calidad de las cards; se descartan la navegación superior, el título vertical, la galería cinética y la card destacada. La estructura actual de NooVDB es la base y no se sustituye.

## 3. Principios

### 3.1 Las portadas son el color principal

El chrome permanece oscuro y controlado. Las portadas pueden ser multicolor y deben conservar la mayor superficie visual de la card.

El fondo global debe leerse negro antes que morado. Los halos violetas son iluminación secundaria de baja opacidad, no una segunda capa cromática dominante.

### 3.2 Una escena, un acento eléctrico

Cada pantalla tiene un único acento dominante: `Purple`, el estado activo, un reflejo especial o un resultado. La composición permanece quieta por defecto. Los colores funcionales no compiten por protagonismo.

### 3.3 El vidrio aparece donde existe profundidad

El frosted glass se usa cuando una superficie flota sobre portadas, luz ambiental o contenido desplazable. Una caja sobre un fondo plano usa superficie sólida.

### 3.4 Del widget pequeño al grande

La coherencia se construye por composición. Los widgets grandes sólo ensamblan widgets menores y tokens compartidos; no inventan una paleta, radio o animación propios.

### 3.5 Motion responde a la persona

La animación aparece como respuesta directa a hover, foco, selección, filtrado o una acción explícita. Si empieza sola, se repite o retrasa una consulta, se elimina.

### 3.6 Responsive recompone, no redecora

Desktop, tablet y móvil comparten tipografía, materiales, color y comportamiento. Sólo cambian rejilla, orden, densidad y navegación.

### 3.7 Maquillaje, no reestructuración

Se conservan la sidebar con labels, el panel de búsqueda y filtros, el selector Cards/Tabla y el grid regular. La antigua cabecera promocional se separa en un app header global compacto y un encabezado propio de cada página. El sistema puede mejorar proporción, ritmo, tipo, color, material y estados, pero no cambia la arquitectura de información sin una necesidad funcional demostrable.

### 3.8 Una información, un lugar

Cada dato tiene una ubicación canónica dentro de la escena. No se repiten cifras, búsquedas, accesos o labels para llenar espacio.

- el estado activo del Nav orienta; el `PageHeader` nombra la página: cumplen funciones diferentes;
- el breadcrumb sólo aparece cuando existe profundidad real y se omite en páginas raíz;
- el contador de resultados es la única aparición de la cantidad filtrada;
- un acceso global no se repite también en el App Header y en el pie de la sidebar;
- no existe una segunda búsqueda en el App Header: el campo del panel de filtros es el único buscador visible;
- un badge `100%` no convive con otra expresión equivalente como `167/167` en el mismo estado de card.

## 4. Paleta

### 4.1 Colores de referencia

| Nombre | Valor | Papel |
|---|---:|---|
| Dark | `#262626` | color primario, superficies y origen de los negros derivados |
| Light | `#ffffff` | texto y contraste |
| Purple | `#9b59b6` | acción, selección y tonalidades de marca |

El lienzo casi negro se deriva de `Dark` mezclándolo con negro; no constituye un cuarto color de marca. Los colores de estados, avisos y foil son señales funcionales de superficie mínima, no parte del chrome.

### 4.2 Tokens operativos

Todos los componentes consumen tokens. Ningún componente de página introduce colores literales.

```css
:root {
  /* Única fuente de verdad editable */
  --brand-dark: #262626;
  --brand-light: #ffffff;
  --brand-purple: #9b59b6;

  /* Alias derivados */
  --brand-night: color-mix(in srgb, var(--brand-dark) 44%, black);
  --brand-plum: color-mix(in srgb, var(--brand-dark) 58%, black);
  --brand-graphite: color-mix(in srgb, var(--brand-dark) 72%, black);
  --brand-midnight: var(--brand-dark);
  --brand-violet-depth: color-mix(in srgb, var(--brand-purple) 34%, var(--brand-dark));
  --brand-violet-deep: color-mix(in srgb, var(--brand-purple) 72%, var(--brand-dark));
  --brand-violet: var(--brand-purple);
  --brand-electric: color-mix(in srgb, var(--brand-purple) 82%, var(--brand-light));
  --brand-magenta: var(--brand-purple);
  --brand-yellow: #ffcc00;
  --brand-ice: var(--brand-light);

  /* Canvas and solid surfaces */
  --ds-canvas: var(--brand-night);
  --ds-canvas-depth: var(--brand-plum);
  --ds-surface-solid: var(--brand-graphite);
  --ds-surface-raised: var(--brand-dark);

  /* Frosted surfaces */
  --ds-glass-soft: color-mix(in srgb, var(--brand-dark) 38%, transparent);
  --ds-glass-default: color-mix(in srgb, var(--brand-dark) 58%, transparent);
  --ds-glass-dense: color-mix(in srgb, var(--brand-dark) 86%, transparent);
  --ds-glass-overlay: color-mix(in srgb, var(--brand-night) 78%, transparent);

  /* Lines and highlights */
  --ds-line-soft: color-mix(in srgb, var(--brand-light) 10%, transparent);
  --ds-line-default: color-mix(in srgb, var(--brand-light) 16%, transparent);
  --ds-line-lit: color-mix(in srgb, var(--brand-purple) 48%, transparent);
  --ds-highlight-glass: color-mix(in srgb, var(--brand-light) 18%, transparent);

  /* Text */
  --ds-text-primary: var(--brand-ice);
  --ds-text-secondary: color-mix(in srgb, var(--brand-light) 72%, transparent);
  --ds-text-muted: color-mix(in srgb, var(--brand-light) 48%, transparent);
  --ds-text-disabled: color-mix(in srgb, var(--brand-light) 28%, transparent);

  /* Brand interaction */
  --ds-action-primary: var(--brand-violet);
  --ds-action-primary-hover: var(--brand-electric);
  --ds-on-primary: var(--brand-night);
  --ds-selection: color-mix(in srgb, var(--brand-purple) 22%, transparent);
  --ds-focus: var(--brand-electric);

  /* Semantic signals: small-area use only */
  --ds-success: #76e096;
  --ds-info: #78b7ff;
  --ds-warning: var(--brand-yellow);
  --ds-danger: #ff4d6d;
  --ds-special: var(--brand-magenta);

  /* Foil reservado para hitos de colección */
  --ds-foil-cyan: rgba(126, 249, 255, 0.42);
  --ds-foil-violet: color-mix(in srgb, var(--brand-purple) 48%, transparent);
  --ds-foil-magenta: color-mix(in srgb, var(--brand-purple) 34%, transparent);
  --ds-foil-gold: rgba(255, 226, 133, 0.44);
  --ds-foil-glint: rgba(255, 255, 255, 0.58);

  /* Shared ambient fields */
  --ds-ambient-main:
    radial-gradient(circle at 76% 10%, color-mix(in srgb, var(--brand-purple) 5.5%, transparent), transparent 32%),
    radial-gradient(circle at 14% 82%, color-mix(in srgb, var(--brand-purple) 4%, transparent), transparent 34%);
  --ds-ambient-hot:
    radial-gradient(circle at 80% 18%, color-mix(in srgb, var(--brand-purple) 4.5%, transparent), transparent 28%);
}
```

### 4.3 Distribución visual

- 70–80%: lienzo y superficies nocturnas.
- 15–25%: portadas, texto y datos.
- 3–6%: `Purple` para interacción y tonalidades.
- menos del 2%: amarillo, foil o estados semánticos.

### 4.4 Reglas de color

- `Dark` es la materia dominante y genera canvas, superficies y vidrio mediante mezclas con negro o transparencia.
- `Light` es el único origen de texto y líneas neutrales.
- `Purple` es la única fuente cromática de marca: acción, selección, foco, profundidad y halo se derivan de ella.
- El botón primario es violeta sólido con texto `--ds-on-primary`; no lleva texto claro sobre un degradado variable.
- Los tonos iridiscentes del foil y los colores de estado son excepciones funcionales; nunca se convierten en chrome.
- Los colores semánticos ocupan dots, badges, tramos de gráfico o mensajes; no tiñen paneles completos.
- Launcher y plataforma son metadatos neutrales.

## 5. Tipografía

### 5.1 Decisión

Los títulos usan **Unbounded**. Su construcción geométrica mantiene el carácter de estudio creativo sin introducir el gesto ilustrativo de Caacupé o Modak.

Los números y el resto de la interfaz usan **Space Grotesk**, pero se mantienen como dos roles independientes. Aunque hoy compartan familia, `--font-numbers` podrá cambiarse sin afectar controles, labels o párrafos.

Sólo existen tres variables maestras de tipografía. Las fuentes se sirven localmente mediante Fontsource.

```css
:root {
  --font-title: "Unbounded Variable", "Arial Black", sans-serif;
  --font-numbers: "Space Grotesk Variable", system-ui, sans-serif;
  --font-text: "Space Grotesk Variable", system-ui, sans-serif;

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
| Marquee | Unbounded | `--ds-type-marquee` | 600 | palabra expresiva |
| Page title | Unbounded | `--ds-type-page` | 400 | título principal |
| Section title | Unbounded | 28px | 600 | bloque de contenido |
| Card title | Space Grotesk | 20px | 700 | nombre de juego |
| Number | Space Grotesk | según contexto | 700 | métricas y datos tabulares |
| Body | Space Grotesk | 16px | 400 | texto general |
| UI | Space Grotesk | 14px | 600 | controles |
| Label | Space Grotesk | 12px | 650 | badge y etiqueta |
| Micro | Space Grotesk | 11px | 500 | metadato secundario breve |

Reglas:

- Unbounded se usa en fragmentos breves: máximo dos líneas y nunca en párrafos, formularios, números o badges.
- Un título display puede ser enorme; no se compensa llenando alrededor de cajas pequeñas.
- Las mayúsculas se reservan para display, eyebrow y etiquetas breves.
- Números y métricas usan `--font-numbers` con cifras tabulares.
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
    shell/
      AppShell.astro
      AppHeader.astro
      Sidebar.astro
      PageHeader.astro
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

### 8.2.1 Nomenclatura de producto y código

| Concepto | Contrato |
|---|---|
| **NooVDB** | Nombre único de la aplicación y del paquete (`noovdb`). `Personal Database` funciona sólo como descriptor. |
| **Game Card** | Tarjeta accionable del catálogo. `CatalogGameCard.astro` la renderiza en servidor; `CatalogClientTemplates.astro` contiene la plantilla usada al filtrar en cliente. Ambas usan `.game-card` y exponen `[data-game-card]`. |
| **Game Card Golden** | Variante de Game Card para un juego con todos los logros. Usa `data-game-card-variant="golden"` y `.is-golden`; no es un segundo componente. |
| **Game Sheet / Ficha técnica** | Página individual en `src/pages/games/[slug].astro`. “Ficha técnica” es la denominación visible en español; los módulos internos conservan el prefijo `GameDetail*`. |

Los nombres de variables indican su alcance:

- `--brand-*` y `--font-*` son las seis entradas maestras de identidad;
- `--ds-*` son tokens derivados compartidos y no se reasignan por página;
- `--game-card-*` y `--game-sheet-*` son variables locales de interacción o geometría;
- las variables TypeScript describen el dato real (`hasCompletedAchievements`) y sólo la capa de presentación decide si activa la variante Golden.

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

Las pastillas forman un lenguaje semántico estable, no una decoración intercambiable:

- `Todos` usa el tono de selección violeta;
- los filtros de estado conservan su dot y token de estado: `Terminado`, `Jugando` y `Pendiente`;
- los filtros de atributo mantienen identidad propia: `Free to play`, `Amortizado`, `Recurrentes` y `Early Access`;
- launcher y plataforma son neutrales y nunca toman el color de un estado;
- género pertenece a filtros avanzados y no sustituye a la fila de filtros rápidos;
- el color se deriva de `value`; una página no pasa un hex ni elige un `tone` arbitrario;
- hover cambia borde o materia; selected añade contraste y anillo interior sin convertir toda la fila en botones sólidos.

```ts
type CatalogQuickFilter =
  | 'all'
  | 'completed'
  | 'playing'
  | 'pending'
  | 'free-to-play'
  | 'amortized'
  | 'recurring'
  | 'early-access';

type FilterChipProps = {
  value: CatalogQuickFilter;
  selected: boolean;
  count?: number;
};
```

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
2. overlay frosted inferior oculto en reposo y revelado sobre la portada;
3. título del juego;
4. launcher/plataforma como metadato neutral;
5. estado compacto;
6. una métrica principal;
7. metadato secundario opcional;
8. acción contextual discreta.

### 9.2 Reposo y jerarquía

- La portada ocupa toda la card en reposo; el contenido no le roba superficie hasta que se solicita.
- Sólo persisten sobre la portada los marcadores excepcionales, como `100%`.
- El título y la métrica principal dominan el overlay.
- El estado es pequeño y no compite con la portada.
- Nunca se añaden más de dos filas de metadatos dentro del overlay.
- Un logro ya expresado por el badge `100%` no se repite como fracción de logros dentro del overlay.
- La card completa puede ser un enlace; las acciones internas deben evitar zonas de click anidadas inválidas.

### 9.3 Estado de interacción

- hover y `focus-visible` revelan el mismo contenido;
- elevación máxima: `translateY(-4px)`;
- zoom de portada: máximo 2%;
- tilt continuo siguiendo el puntero: máximo 3 grados por eje;
- borde o halo violeta localizado, no marco de neón completo;
- el overlay aparece en `180–220 ms`, sin rebote y sin desplazar otras cards;
- al salir, tilt, imagen y overlay vuelven a reposo con una transición de hasta `240 ms`;
- en touch, el primer tap revela el overlay y el segundo abre la ficha.

### 9.4 Foil reactivo para `100%`

El acabado foil es un premio de colección, no una decoración general.

- sólo se activa en una card con `100%` de logros verificado;
- no tiene shimmer, barrido ni loop automático;
- reflejo, espectro iridiscente y grano fino siguen la posición normalizada del puntero dentro de la card;
- el centro del reflejo y el tilt comparten la misma lectura de `pointerX` y `pointerY` para que parezcan una sola superficie;
- la zona luminosa ocupa aproximadamente el 40–50% de la card y mantiene una opacidad baja para no lavar la portada;
- el foil usa cyan, violeta, magenta y oro de los tokens, con un glint blanco muy localizado;
- al salir del hover, el reflejo pierde opacidad y vuelve al centro en `220–280 ms`;
- sin hover preciso se conserva únicamente el badge `100%` y un borde oro tenue;
- sólo una card puede calcular y mostrar foil a la vez.

### 9.5 Variantes permitidas

- `standard`: card principal del grid;
- `compact`: menos metadatos, misma proporción;
- `featured`: mayor escala y tratamiento editorial, misma anatomía;
- `mobile`: composición vertical o apaisada definida por el contenedor, mismos tokens.

No existen variantes por página que cambien colores, radios o tipografía.

## 10. Patrones de escena

### 10.1 App shell compartido

`AppShell` es infraestructura común y conserva la misma geometría en catálogo, ruleta, estadísticas, metacrítica, pendientes y ficha.

- sidebar desktop fija de `248 px`, a altura completa y desde la esquina superior izquierda;
- marca `NOOVDB` y descriptor `PERSONAL DATABASE` sólo en la cabecera de la sidebar;
- orden global: Catálogo, Ruleta, Estadísticas, Metacrítica y Pendientes;
- GitHub aparece una sola vez, en el pie de la sidebar;
- un único control de colapso; no se duplica en cabecera y pie;
- estado activo con fondo violeta translúcido, indicador izquierdo de `3 px`, icono más luminoso y label visible;
- App Header de `60–68 px`, sólo sobre la columna principal, plano y separado por una línea;
- el App Header contiene el control de navegación móvil y breadcrumb condicional; no contiene buscador ni acciones duplicadas;
- en desktop se oculta por completo en páginas raíz sin contexto; en una ruta profunda muestra sólo ancestros útiles;
- en tablet y móvil permanece visible para alojar el control del drawer compartido;
- títulos, métricas, tabs y acciones de dominio pertenecen al `PageHeader` o al contenido, nunca al App Header.

Desktop no usa navegación superior ni rail de iconos. En móvil, el mismo inventario de destinos se recompone mediante navegación móvil; no se crea un menú distinto por página.

### 10.2 Catálogo

- `PageHeader` sin caja, dentro de la columna de contenido.
- Titular `CATÁLOGO` en Unbounded y tres métricas: horas, gasto y logros.
- La cantidad de juegos no aparece en las métricas; vive únicamente en el contador de resultados y cambia con los filtros.
- Búsqueda, botón de filtros, contador, selector Cards/Tabla y filtros rápidos conservan su orden actual.
- La fila rápida conserva `Todos`, `Terminado`, `Jugando`, `Pendiente`, `Free to play`, `Amortizado`, `Recurrentes` y `Early Access`, con sus dots semánticos.
- Grid estrictamente regular de cuatro columnas en desktop; no hay carrusel, abanico, deck ni card destacada.
- Las cards son la masa visual principal y mantienen el contenido oculto hasta hover, foco o tap.
- La profundidad violeta permanece dentro de superficies y reflejos localizados; no se añade un campo ambiental animado.

### 10.3 Ficha

- Hero de portada y título como feature widget.
- Datos divididos por ritmo y alineación antes que por cajas.
- Finanzas, progreso y sesiones componen widgets menores.
- Máximo un contenedor visible dentro de otro.

### 10.4 Estadísticas

- El gráfico es protagonista; las métricas lo apoyan.
- No asignar un color decorativo distinto a cada número.
- El violeta identifica selección o serie principal; los demás colores son funcionales.

### 10.5 Ruleta

- La rueda es el gesto visual único.
- Formulario y resultado se subordinan a ella.
- El glow puede intensificarse durante el giro y disiparse al detenerse.

### 10.6 Navegación

- Una sidebar desktop, un App Header y una navegación móvil compartidos por todas las escenas.
- Logo, orden, iconos, espaciado y estado activo no cambian por página.
- En desktop se mantienen icono y label; no se sustituye por navegación superior ni rail compacto.
- El estado activo combina frosted sutil, una línea violeta fina y un icono ligeramente iluminado; no depende de rellenar todo el botón de violeta.
- El App Header mantiene altura y posiciones; sólo cambia el breadcrumb cuando existe profundidad real.
- El título de página nunca se usa como sustituto de la marca ni se incrusta en el App Header.

## 11. Microinteracción y GSAP

La interfaz permanece quieta por defecto. CSS resuelve color, borde, opacidad y la apertura simple del overlay. GSAP se reserva para valores continuos ligados al puntero y para una reorganización de resultados cuando realmente aporte continuidad.

### 11.1 Tokens de tiempo

```css
:root {
  --ds-motion-instant: 100ms;
  --ds-motion-fast: 140ms;
  --ds-motion-base: 220ms;
  --ds-motion-settle: 300ms;
}
```

Curvas GSAP aprobadas:

- microinteracción: `power2.out`;
- seguimiento de puntero: interpolación corta y sin rebote;
- reorganización: `power2.inOut`;
- rebote: no se usa en catálogo.

### 11.2 Presets

| Preset | Uso | Movimiento |
|---|---|---|
| `card-reveal` | card activa | overlay, imagen y halo en 180–220 ms |
| `card-tilt` | card activa | `rotateX`/`rotateY` continuos, máximo 3 grados |
| `golden-foil` | Game Card Golden activa | posición de reflejo y espectro ligada al puntero |
| `filter-layout` | resultados que cambian | continuidad breve de posición, 220–300 ms |
| `selection-feedback` | chip o vista activa | borde, materia y opacidad en 100–140 ms |

### 11.3 Contrato técnico futuro

- Los componentes renderizan `data-motion` y no crean timelines arbitrarias.
- `src/scripts/motion/presets.ts` es la única fuente de duraciones, eases y distancias GSAP.
- Cada inicializador usa `gsap.context()` con scope local y devuelve cleanup.
- `gsap.matchMedia()` controla desktop, móvil, puntero y preferencia de movimiento.
- Tilt y foil usan setters interpolados, no una timeline nueva por cada `pointermove`.
- La geometría de la card se calcula al entrar y se invalida al redimensionar; no se fuerza layout en cada frame.
- Una navegación o desmontaje revierte contextos y listeners.
- El catálogo no usa `ScrollTrigger`.
- Las animaciones de hover deben poder interrumpirse y revertirse sin saltos.
- Se priorizan `transform` y `opacity`; no se anima layout completo.

### 11.4 Límites

- No hay loops ambientales en catálogo.
- No hay partículas constantes, cursor personalizado ni texto flotante por defecto.
- No hay brillos automáticos: el foil sólo existe mientras responde al puntero.
- Sólo reacciona la card bajo el puntero; nunca ondula el grid completo.
- No usar `transition: all`.
- No reproducir una entrada escalonada de todas las cards al cargar o filtrar.
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
- El App Header móvil conserva el control de navegación; el `PageHeader` sigue perteneciendo a cada escena.
- Los filtros avanzados se convierten en drawer o sheet.
- Las acciones frecuentes siguen visibles; las secundarias pueden entrar en menú.
- En desktop, hover y foco revelan el panel de datos de la card; en touch lo hace el primer tap.
- Se conserva foco visible y semántica nativa en enlaces, botones, inputs y progreso.
- `prefers-reduced-motion` desactiva tilt y seguimiento del foil; el overlay conserva una transición corta y el estado `100%`, un borde estático.

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
2. Servir Unbounded y Space Grotesk localmente mediante Fontsource.
3. Crear el registro de microinteracciones GSAP, empezando por tilt y foil.
4. Añadir una comprobación que impida nuevos valores visuales crudos.

### Fase 2 — Del widget pequeño al grande

1. `Badge`, `StatusDot`, `IconButton` y `MiniMetric`.
2. `Button`, `FilterChip`, `DateValue`, `DatePill` y `DateRange`.
3. `WidgetFrame`, `Metric` y `ProgressBar`.
4. `AppShell`, `AppHeader`, `Sidebar` y `PageHeader`.
5. `CatalogGameCard` y `GameStatusBadge`.
6. `FilterDock`, `StatsStrip` y navegación compartida.
7. Escena completa de catálogo.

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
- usa el mismo `AppShell` en todas las escenas y mantiene su geometría estable;
- separa App Header global de `PageHeader` y no repite información simultáneamente visible;
- conserva la sidebar, filtros y grid regular de la interfaz actual;
- preserva labels, orden, dots y significado de los filtros rápidos;
- usa la escalera de widgets y no crea componentes monolíticos;
- no introduce valores visuales fuera de tokens;
- no supera dos contenedores visibles anidados;
- usa frost sólo cuando existe profundidad real;
- las cards respetan anatomía, proporción, reveal, tilt y foil canónicos;
- mantiene estados aplicables de hover, focus, active, selected, loading, disabled, error y empty;
- funciona en los viewports de revisión;
- limpia correctamente timelines y listeners;
- pasa build y comparación visual contra el mockup aprobado.

## 17. Brief del mockup revisado

El mockup representa el catálogo desktop a 1440 × 1024 y usa como plantilla espacial la captura actual. Es un facelift con app shell normal y reutilizable, no una escena editorial independiente.

Debe mostrar:

- lienzo Carbon Black claramente casi negro, con profundidad violeta apenas perceptible y localizada;
- sidebar fija de altura completa con marca `NOOVDB`, descriptor `PERSONAL DATABASE`, Nav, GitHub y un solo control de colapso;
- App Header contextual de `60–68 px`, sin título, métricas ni búsqueda duplicada; oculto en la raíz desktop y visible para navegación móvil;
- `PageHeader` de catálogo dentro del contenido, con título `CATÁLOGO` en Unbounded;
- horas, gasto y logros como métricas; la cantidad de juegos no se repite aquí;
- sidebar completa y menú con el mismo orden actual;
- una sola búsqueda de catálogo, filtros, contador dinámico, Cards/Tabla y chips en sus posiciones actuales;
- chips rápidos de estado y atributo con los labels y dots existentes, nunca reemplazados por géneros;
- grid regular de cuatro columnas de cards verticales;
- varias cards en reposo mostrando sólo portada;
- una card bajo hover con tilt ligero y overlay frosted desplegado;
- esa card activa marcada `100%`, con foil iridiscente concentrado alrededor de la posición del puntero;
- `Purple #9B59B6` como acción, selección y tonalidad de marca;
- cyan y oro sólo dentro del foil o de un detalle excepcional;
- profundidad localizada, sin convertir la captura en concept art.

Debe evitar:

- navegador o marco de dispositivo;
- landing page, hero comercial o copy promocional;
- navegación superior, rail compacto o título vertical;
- breadcrumb redundante en páginas raíz;
- dos búsquedas visibles con el mismo propósito;
- repetir cantidad de juegos, acceso a GitHub, control de colapso o progreso `100%`;
- cambiar las pastillas semánticas por una fila genérica de géneros;
- carrusel, cards inclinadas en reposo, deck o card destacada;
- paneles corporativos;
- cards dentro de cards;
- glow alrededor de todos los elementos;
- ambientación animada, partículas o brillos automáticos;
- más controles de los necesarios para explorar la biblioteca;
- sacrificar tamaño de portada para enseñar muchas funciones.

Las decisiones estructurales quedan cerradas antes del mockup:

1. grid estrictamente regular;
2. app shell normal con sidebar completa y App Header compacto;
3. `PageHeader` separado del Header global;
4. contenido de card oculto en reposo y revelado mediante hover, foco o tap;
5. pastillas semánticas conservadas como mecanismo canónico;
6. motion sutil y reactivo, nunca coreografiado por defecto.

## 18. Referencias técnicas

- Paquetes locales `@fontsource-variable/unbounded` y `@fontsource-variable/space-grotesk` instalados en el proyecto.
- [Documentación oficial de `gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/): condiciones responsive y cleanup de animaciones.
