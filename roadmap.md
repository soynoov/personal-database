# Roadmap

Leyenda: `[x]` hecho · `[-]` parcial · `[ ]` pendiente.

## Nombres y responsabilidades

| Concepto | Definición | Estado actual |
|---|---|---|
| **Game Card** | Tarjeta accionable del catálogo. Al pulsarla abre la Game Sheet del juego. | [x] La navegación existe. El servidor usa `CatalogGameCard.astro`; la plantilla cliente aún se llama `GameCard.astro`. |
| **Game Card Golden** | Variante de Game Card para juegos con todos los logros, con tratamiento dorado y efecto foil. | [-] Existe la detección y el distintivo, pero el código todavía usa nombres `platinum` y no tiene el foil reactivo solicitado. |
| **Game Sheet / Ficha Técnica** | Página individual del juego en `src/pages/games/[slug].astro`. | [x] Existe y se abre desde la Game Card. |

## Visual Updates

- [ ] Game Card: añadir tilt de hasta 3° siguiendo la posición del puntero. El overlay de información existente debe conservarse.
- [ ] Game Card Golden: añadir un efecto foil que siga la posición del puntero.
- [ ] Desactivar tilt y foil con `prefers-reduced-motion` y cuando no exista un puntero preciso.
- [ ] Game Sheet · Horas: ajustar la composición a la captura objetivo para que la gráfica se una al bloque superior sin hueco ni solapamiento.

## Variables Updates

- [ ] Definir variables maestras por función:
  - `--font-title`: tipografía de títulos.
  - `--font-text`: tipografía de interfaz y texto.
  - `--font-numbers`: tipografía numérica independiente.
- [ ] Definir variables maestras de identidad cromática:
  - `--brand-dark`: base oscura.
  - `--brand-light`: texto y contraste.
  - `--brand-purple`: acento de marca.
- [ ] Separar el alcance de las variables:
  - `--brand-*` y `--font-*`: identidad editable.
  - `--ds-*`: tokens derivados compartidos.
  - `--game-card-*` y `--game-sheet-*`: estado y geometría local de componentes.
- [ ] Migrar gradualmente colores y medidas literales heredados; no mezclar esta migración con cambios funcionales.

## Futuro — Histórico de precios

- [ ] Almacenar una serie temporal equivalente a la gráfica de dinero de SteamDB, conservando como mínimo fecha, precio, descuento, moneda y procedencia.
- [ ] Representar esos datos con una gráfica de lectura financiera: eje temporal, evolución del precio, mínimos, máximos y marcador del precio de compra, con una apariencia similar a una gráfica de compra y venta de acciones.
- [ ] Antes de implementarlo, decidir el mecanismo de obtención y actualización, el modelo persistente y los límites de uso de la fuente.

Esta fase queda documentada para el futuro; no debe implementarse todavía.
