# EvaDB Design System

Estado: propuesta normativa 1.0

Última revisión: 2026-09-04

Referencia visual principal: cards del catálogo

## 1. Decisión de diseño

EvaDB adopta las cards del catálogo como ancla visual, no como plantilla literal para toda la interfaz.

La gramática común será:

- lienzo oscuro y neutro;
- superficies ligeramente diferenciadas por luminosidad, no por gradientes distintos;
- bordes finos y radios consistentes;
- imagen y datos como protagonistas;
- violeta reservado para selección, foco y acción principal;
- colores de estado reservados para significado;
- tipografía display sólo para títulos con jerarquía real;
- densidad compacta, pero sin texto menor de 12 px;
- una sola elevación visible por bloque, evitando vidrio dentro de vidrio.

Estandarizar no significa convertir cada bloque en una card. Una página debe conservar jerarquía entre fondo, sección, panel, card y control.

## 2. Diagnóstico del sistema actual

El catálogo, las estadísticas, la ruleta y las fichas parecen partes de la misma marca, pero no del mismo sistema.

### Evidencia visual

1. **Catálogo desktop — referencia principal.** Buena separación entre navegación, controles y contenido. Las imágenes dominan; el color del chrome es contenido.
2. **Estadísticas — divergencia alta.** Los paneles son rectangulares y planos, los colores de métricas son mucho más saturados y la composición de cabecera/sidebar cambia.
3. **Ficha — alineación parcial.** Comparte oscuridad, violeta y bordes, pero acumula demasiados niveles de contenedores, radios y tratamientos de profundidad.
4. **Ruleta — alineación parcial.** La navegación es coherente, pero la cabecera, el formulario y el panel principal usan otra combinación de superficies y radios.
5. **Catálogo móvil — segunda referencia.** La card adapta su estructura correctamente; debe conservar los mismos tokens y roles tipográficos que desktop.

### Evidencia del código

El inventario actual contiene 48 archivos CSS y, mediante un recuento mecánico, aproximadamente:

- 445 valores hexadecimales distintos;
- 40 expresiones distintas de `border-radius`;
- 158 expresiones distintas de `font-size`;
- 105 declaraciones de `backdrop-filter`;
- 170 declaraciones de `box-shadow`.

Estas cifras incluyen variantes responsive y repeticiones legítimas; no equivalen a 445 colores visibles. Sí demuestran que demasiadas decisiones visuales se resuelven localmente.

### Problemas estructurales

- Hay tokens globales, pero muchos componentes usan valores crudos en paralelo.
- Existen radios de 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24 y 32 px.
- La escala tipográfica está fragmentada en variaciones de décimas de `rem` sin una jerarquía reconocible.
- Los paneles alternan vidrio, fondo sólido, degradados, sombras internas y sombras externas sin una regla de nivel.
- Una misma acción de edición puede aparecer como botón con texto, icono cuadrado o control integrado, dependiendo de la página.
- Fechas, dinero, duración, estados y métricas se formatean en cada contexto en vez de usar una primitiva semántica común.

## 3. Principios

### 3.1 El contenido aporta personalidad; la interfaz aporta orden

Las portadas, gráficos y datos pueden ser coloridos. Navegación, filtros, paneles y controles deben ser neutros para no competir con ellos.

### 3.2 El color debe significar algo

- Violeta: acción principal, selección y foco.
- Verde: éxito o completado.
- Ámbar: pendiente o advertencia.
- Rojo: error, pérdida o abandono.
- Rosa: wishlist.
- Azul: información.

No se asigna un color nuevo a cada página o métrica.

### 3.3 La profundidad debe ser limitada

Sólo se permiten tres niveles de superficie. Un bloque no debe tener más de dos contenedores visibles anidados. `backdrop-filter` queda reservado para overlays sobre imágenes, navegación flotante y diálogos.

### 3.4 Los componentes representan significado

Un componente `DateValue` debe saber mostrar una fecha de forma consistente y accesible. No debe saber si pertenece a Steam, una compra o una sesión de juego.

### 3.5 Responsive cambia la composición, no el lenguaje

La posición y el número de columnas pueden cambiar. El significado de colores, tipografías, radios, espaciado y estados interactivos no cambia entre breakpoints.

## 4. Tokens normativos

Todos los componentes nuevos deben consumir tokens. Los valores crudos sólo se permiten dentro del archivo de tokens o para datos realmente dinámicos.

### 4.1 Color

```css
:root {
  /* Lienzo y superficies */
  --ds-canvas: #0d0d11;
  --ds-surface-1: #111116;
  --ds-surface-2: #18181f;
  --ds-surface-3: #20212a;
  --ds-surface-selected: #281d3d;

  /* Bordes */
  --ds-border-subtle: rgba(207, 200, 220, 0.12);
  --ds-border-default: rgba(207, 200, 220, 0.18);
  --ds-border-strong: rgba(207, 200, 220, 0.3);

  /* Texto */
  --ds-text-primary: #f7f1ee;
  --ds-text-secondary: #c6bcc0;
  --ds-text-muted: rgba(195, 208, 225, 0.65);
  --ds-text-disabled: rgba(195, 208, 225, 0.38);

  /* Interacción */
  --ds-accent: #a78bfa;
  --ds-accent-strong: #c9a8ff;
  --ds-focus: #d8b4fe;

  /* Semántica */
  --ds-success: #93c572;
  --ds-info: #67b1ff;
  --ds-warning: #d8aa47;
  --ds-danger: #e84060;
  --ds-wishlist: #f7638c;
}
```

Reglas:

- El fondo de página siempre usa `--ds-canvas`.
- Una card normal usa `--ds-surface-2`; hover o selección puede subir a `--ds-surface-3`.
- El violeta no sustituye a un color de estado.
- Plataforma y launcher son metadatos neutrales; no necesitan un arcoíris propio.
- Un estado nunca depende sólo del color: siempre incluye texto y, cuando ayude, icono.

### 4.2 Tipografía

| Rol | Fuente | Tamaño | Peso | Uso |
|---|---|---:|---:|---|
| Display | Anton SC | `clamp(48px, 6vw, 80px)` | 400 | Título principal o nombre de juego |
| Page title | Anton SC | 40px | 400 | Cabecera de página |
| Section title | Elms Sans | 28px | 750 | Título de sección |
| Component title | Elms Sans | 20px | 750 | Card, panel o modal |
| Body | Elms Sans | 16px | 400 | Texto general |
| UI | Elms Sans | 14px | 600 | Botones y controles |
| Meta | Elms Sans | 14px | 400 | Datos secundarios |
| Label | Stack Sans Text | 12px | 650 | Badge, eyebrow y etiqueta compacta |

Reglas:

- Anton SC no se usa en párrafos, formularios, badges ni métricas pequeñas.
- Stack Sans Text se limita a elementos breves; no se usa para contenido largo.
- No se introducen tamaños intermedios sin ampliar primero esta escala.
- El mismo componente mantiene su rol tipográfico en desktop y móvil.

### 4.3 Espaciado

Escala basada en 4 px:

```css
--ds-space-1: 4px;
--ds-space-2: 8px;
--ds-space-3: 12px;
--ds-space-4: 16px;
--ds-space-6: 24px;
--ds-space-8: 32px;
--ds-space-12: 48px;
--ds-space-16: 64px;
```

No usar valores como `0.72rem`, `0.85rem` o `1.1rem` para corregir un componente aislado. Elegir el escalón más cercano y ajustar la composición.

### 4.4 Radios

```css
--ds-radius-sm: 8px;
--ds-radius-md: 12px;
--ds-radius-lg: 16px;
--ds-radius-xl: 24px;
--ds-radius-pill: 999px;
```

| Elemento | Radio |
|---|---:|
| Badge, chip | pill |
| Input, select, botón | 12px |
| Card y panel interno | 16px |
| Panel principal, hero, sidebar | 24px |
| Icono dentro de control | hereda o 8px |

Un contenedor anidado baja un nivel: panel 24 px → card 16 px → control 12 px. No se crean radios de 13, 14, 15, 17, 18 o 22 px.

### 4.5 Bordes, sombra y blur

```css
--ds-shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.22);
--ds-shadow-lg: 0 20px 48px rgba(0, 0, 0, 0.38);
--ds-blur-overlay: 16px;
```

- Panel normal: borde sutil, sin sombra.
- Card interactiva: `--ds-shadow-sm` sólo en hover/focus.
- Dialog o superficie flotante: `--ds-shadow-lg`.
- No combinar sombra exterior, sombra interior, degradado y blur en el mismo contenedor.
- El overlay inferior de la card de catálogo sí puede usar blur porque está sobre una imagen.

### 4.6 Iconografía

- Única familia: Tabler Icons.
- Tamaños permitidos: 16, 20 y 24 px.
- Stroke coherente con el icono original.
- Un botón de sólo icono necesita `aria-label` y un área mínima de 40 × 40 px; 44 × 44 px en móvil.
- No usar emoji, caracteres Unicode o SVG manual cuando exista un icono equivalente.

### 4.7 Movimiento

```css
--ds-duration-fast: 120ms;
--ds-duration-normal: 180ms;
--ds-duration-slow: 240ms;
--ds-ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

- Hover y foco: 120–180 ms.
- Cambio de panel o reveal: máximo 240 ms.
- No animar layout completo ni usar `transition: all`.
- Respetar `prefers-reduced-motion`.

## 5. Jerarquía de superficies

### Nivel 0 — Page

Fondo global. No lleva borde ni sombra.

### Nivel 1 — Shell

Agrupa una zona principal: sidebar, hero, filtros o sección de ficha. Usa `surface-1`, borde sutil y radio XL.

### Nivel 2 — Panel

Agrupa información relacionada. Usa `surface-2`, borde sutil y radio LG.

### Nivel 3 — Interactive

Card, input o elemento seleccionable. Usa `surface-3` sólo cuando necesita separación o interacción.

Reglas de composición:

- No colocar un panel Nivel 2 dentro de otro Nivel 2 si ambos tienen borde y fondo.
- Si una agrupación sólo necesita separación, usar espacio o una línea; no otra caja.
- Las cards de métricas de estadísticas deben adoptar la misma superficie, borde y radio que las cards de datos de ficha.

## 6. Componentes Astro estándar

Los componentes base viven en `src/components/ui/`. Los componentes de dominio continúan en `src/components/` o en una carpeta de la funcionalidad.

```text
src/components/ui/
  Badge.astro
  Button.astro
  DatePill.astro
  DateValue.astro
  EmptyState.astro
  FormField.astro
  IconButton.astro
  Metric.astro
  ProgressBar.astro
  SectionHeader.astro
  Select.astro
  Surface.astro
```

### 6.1 `Surface.astro`

Responsabilidad: aplicar una superficie coherente, sin conocer el contenido.

```ts
type Props = {
  as?: 'div' | 'section' | 'article' | 'aside';
  level?: 1 | 2 | 3;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
};
```

No debe aceptar colores, sombras o radios arbitrarios.

### 6.2 `Button.astro`

```ts
type Props = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  href?: string;
  iconStart?: string;
  iconEnd?: string;
};
```

- Primary: una acción dominante por región.
- Secondary: acción normal con borde.
- Ghost: navegación o acción de baja prioridad.
- Danger: sólo acciones destructivas.
- Los enlaces que navegan usan `<a>`; las acciones usan `<button>`.

### 6.3 `IconButton.astro`

Para editar, cerrar, expandir o abrir menús. Debe normalizar tamaño, borde, foco, tooltip/label y estado disabled.

### 6.4 `Badge.astro`

```ts
type Props = {
  tone?: 'neutral' | 'accent' | 'success' | 'info' | 'warning' | 'danger' | 'wishlist';
  size?: 'sm' | 'md';
  icon?: string;
};
```

`Badge` es informativo. Un elemento clickable debe ser `Button`, `ChipButton` o enlace, aunque visualmente sea compacto.

### 6.5 Fechas: `DateValue.astro` y `DatePill.astro`

No todas las fechas deben verse como una pastilla. La estandarización correcta separa semántica y presentación:

- `DateValue`: parsea, formatea y genera `<time datetime="…">`.
- `DatePill`: compone `DateValue` dentro de un badge cuando la fecha funciona como metadato compacto o filtro.

```ts
type DateValueProps = {
  value: string | Date | null | undefined;
  format?: 'compact' | 'medium' | 'long';
  fallback?: string;
  showIcon?: boolean;
};

type DatePillProps = DateValueProps & {
  tone?: 'neutral' | 'accent' | 'warning';
};
```

Formatos:

| Variante | Ejemplo | Uso |
|---|---|---|
| compact | `03 sep 2026` | cards, tablas, historial |
| medium | `3 septiembre 2026` | formularios y paneles |
| long | `jueves, 3 de septiembre de 2026` | detalle accesible o contexto editorial |

Reglas:

- Fuente de verdad: ISO `YYYY-MM-DD` o `Date`; nunca texto ya formateado.
- Fallback único: `Sin registrar`.
- Evitar fechas relativas como “hace 2 días” salvo que el producto defina cuándo se actualizan.
- Las fechas de inicio y fin se componen en un `DateRange`, no concatenando strings en cada página.

Ejemplo:

```astro
<DatePill value={game.fecha_inicio} format="compact" showIcon />
<DateValue value={game.fecha_fin} format="medium" fallback="Sin finalizar" />
```

### 6.6 `Metric.astro`

Normaliza etiqueta, valor, unidad, icono, comparación y estado vacío. Debe admitir dinero, duración, porcentaje y cantidad sin decidir sus fórmulas.

```ts
type Props = {
  label: string;
  value: string | number;
  unit?: string;
  supportingText?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  icon?: string;
};
```

### 6.7 `SectionHeader.astro`

Unifica eyebrow, título, descripción y acción lateral. Sustituye las cabeceras particulares de cada página y sección.

### 6.8 `FormField.astro` y `Select.astro`

`FormField` controla label, ayuda, error y relación `aria-describedby`. `Select` controla altura, borde, icono y estados. El layout del formulario pertenece a la página, no al input.

### 6.9 `ProgressBar.astro`

Unifica track, fill, label, valor y semántica `aria-valuenow`. El color sólo cambia por significado, no por sección.

### 6.10 `EmptyState.astro`

Unifica icono, título, descripción y acción. Evita textos sueltos como `-`, `N/A`, `Sin datos` y `No registrado` usados indistintamente.

## 7. Componentes de dominio

Los componentes base no deben absorber reglas del producto.

- `CatalogGameCard` sigue siendo un componente de dominio.
- `DLCCard` sigue siendo un componente de dominio.
- `GameFinanceSummary` puede componer `Surface`, `Metric` y `ProgressBar`.
- `GameStatusBadge` puede envolver `Badge` y traducir `estado` a un tono.
- `PurchaseDate` puede componer `DateValue`, pero no duplicar el formateo.

Evitar un componente universal con numerosos booleanos como `isGame`, `isDlc`, `isFinance`, `isCompact` o `isStats`. Cuando cambia el significado, cambia el componente de dominio; cuando sólo cambia la presentación permitida, se usa una variante limitada.

## 8. Patrones clave

### 8.1 Card de catálogo

La card canónica conserva:

- ratio vertical de portada;
- radio LG;
- overlay inferior sobre imagen;
- título, badges y dato principal;
- hover sutil con elevación y zoom máximo del 4%;
- borde de estado sólo durante interacción o selección;
- variante móvil siempre legible, sin depender de hover.

No se debe copiar su overlay de imagen en cards de datos, formularios o métricas.

### 8.2 Panel de filtros

- Surface Nivel 1.
- Campo de búsqueda y botón de filtros con la misma altura.
- Chips interactivos implementados como botones, no como badges.
- Estado seleccionado mediante fondo, borde y `aria-pressed`, no sólo color.

### 8.3 Métricas

- El valor es siempre el elemento de mayor contraste.
- La etiqueta usa el rol Label.
- La unidad queda un nivel por debajo del número.
- Verde, ámbar y rojo sólo expresan estado; una cifra normal no recibe color decorativo.

### 8.4 Formularios

- Altura mínima desktop: 40 px; móvil: 44 px.
- Labels visibles; placeholder no sustituye a label.
- Error junto al campo y resumen al enviar cuando haya varios errores.
- Acciones alineadas: secundaria primero, primaria al final.

### 8.5 Navegación

Debe existir una única implementación de sidebar y una única implementación de navegación móvil. Logo, orden, iconos, estado activo y espaciado no cambian por página.

## 9. Accesibilidad mínima

- Contraste de texto normal: objetivo WCAG AA 4.5:1.
- Contraste de texto grande y elementos gráficos relevantes: 3:1.
- Foco visible de 2 px con `--ds-focus` y separación suficiente del borde.
- Objetivos táctiles de al menos 44 × 44 px.
- No ocultar información esencial hasta hover.
- No depender sólo de color para estados o selección.
- `<time datetime>` para fechas y `<progress>` o ARIA equivalente para progreso.
- Orden DOM coherente con el orden visual.
- Zoom al 200% sin pérdida de contenido o acciones.

Una captura no demuestra cumplimiento completo; teclado, lector de pantalla, contraste calculado y reflow deben verificarse durante la implementación.

## 10. Reglas de implementación

1. No añadir colores hexadecimales fuera de `tokens.css`, salvo valores derivados de datos.
2. No añadir radios o tamaños tipográficos fuera de las escalas.
3. No usar `!important`.
4. No usar `transition: all`.
5. No añadir otro sistema de iconos.
6. No formatear fechas, dinero o duraciones directamente en páginas `.astro`.
7. Las páginas orquestan; los componentes renderizan; `src/lib/` formatea y calcula datos.
8. Cada componente base documenta props, variantes, estados y un ejemplo.
9. Cada variante nueva debe resolver al menos dos casos reales; si sólo resuelve uno, permanece en el componente de dominio.
10. El catálogo es la referencia de regresión visual durante la migración.

## 11. Migración recomendada

### Fase 0 — Congelar divergencia

- Crear `src/styles/tokens.css` con los tokens normativos.
- Mantener aliases temporales para variables existentes.
- No introducir nuevos valores visuales crudos.

### Fase 1 — Primitivas de alto retorno

Implementar, en este orden:

1. `Button` e `IconButton`.
2. `Badge` y `GameStatusBadge`.
3. `DateValue`, `DatePill` y `DateRange`.
4. `Surface` y `SectionHeader`.
5. `Metric` y `ProgressBar`.
6. `FormField`, `Select` y `EmptyState`.

### Fase 2 — Página de inventario visual

Crear una ruta interna `/design-system` que muestre:

- todos los tokens;
- variantes y estados de cada componente;
- hover, focus, disabled, error, loading y empty;
- desktop y móvil;
- ejemplos con datos reales de EvaDB.

Esta ruta será el contrato visual antes de migrar páginas.

### Fase 3 — Migración por verticales

1. Catálogo: sustituir controles y badges sin alterar su composición canónica.
2. Estadísticas: unificar sidebar, cabecera, radios, superficies y métricas.
3. Ruleta: migrar formulario, botones, chips y panel lateral.
4. Ficha: reducir cajas anidadas y migrar fechas, métricas, progreso y acciones de edición.
5. Pendientes y Metacrítica: aplicar las primitivas ya validadas.

No hacer una reescritura global de CSS en un solo cambio. Cada vertical debe tener comparación visual antes/después y build independiente.

### Fase 4 — Retirada de legacy

- Eliminar aliases sin uso.
- Consolidar CSS duplicado.
- Bloquear nuevos valores crudos mediante lint o una comprobación de CI.
- Mantener un changelog breve del sistema.

## 12. Criterios de aceptación

Una pantalla se considera migrada cuando:

- usa la sidebar y navegación móvil comunes;
- no introduce colores, radios, tipografías o sombras fuera del sistema;
- botones, badges, fechas, métricas y campos usan componentes estándar;
- mantiene estados hover, focus, disabled, error y empty;
- funciona a 390, 820 y 1440 px;
- el contenido esencial no depende de hover;
- pasa build y revisión visual;
- no aumenta la profundidad de contenedores sin una razón funcional.

## 13. Primera entrega propuesta

La primera implementación debe ser pequeña y verificable:

1. tokens nuevos con aliases de compatibilidad;
2. `Button`, `IconButton`, `Badge`, `DateValue` y `DatePill`;
3. página `/design-system` con sus estados;
4. migración de un botón, un badge y una fecha reales de catálogo/ficha;
5. comparación visual desktop y móvil.

El objetivo de esa entrega no es rediseñar toda EvaDB. Es demostrar que el sistema puede sustituir estilos locales sin perder identidad ni funcionalidad.
