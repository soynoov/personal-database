# Roadmap

Leyenda: `[x]` hecho · `[-]` parcial · `[ ]` pendiente.

## Nombres y responsabilidades

| Concepto | Definición | Estado actual |
|---|---|---|
| **Game Card** | Tarjeta accionable del catálogo. Al pulsarla abre la Game Sheet del juego. | [x] La navegación existe. El servidor usa `CatalogGameCard.astro`; la plantilla cliente aún se llama `GameCard.astro`. |
| **Game Card Golden** | Variante de Game Card para juegos con todos los logros, con tratamiento dorado y efecto foil. | [-] Existe la detección y el distintivo, pero el código todavía usa nombres `platinum` y no tiene el foil reactivo solicitado. |
| **Game Sheet / Ficha Técnica** | Página individual del juego en `src/pages/games/[slug].astro`. | [x] Existe y se abre desde la Game Card. |

## Visual Updates

- [x] Game Card: tilt de 2,4° siguiendo la posición del puntero, sin alterar el overlay de información existente.
- [ ] Game Card Golden: añadir un efecto foil que siga la posición del puntero.
- [-] Desactivar tilt y foil con `prefers-reduced-motion` y cuando no exista un puntero preciso. El tilt ya lo respeta; queda aplicarlo al foil.
- [ ] Game Sheet · Horas: ajustar la composición a la captura objetivo para que la gráfica se una al bloque superior sin hueco ni solapamiento.

## Variables Updates

- [ ] Definir variables maestras por función:
  - `--font-title`: tipografía de títulos.
  - `--font-text`: tipografía de interfaz y texto.
  - `--font-numbers`: tipografía numérica independiente.
- [x] Definir los tres colores maestros de identidad cromática:
  - `--theme-black`: lienzo negro.
  - `--theme-white`: blanco cálido para texto y contraste.
  - `--theme-purple`: matizador morado para interacción y selección.
- [x] Separar `--editorial-red` como excepción para microcopy de marca, incluido «Personal Database»; no cuenta como cuarto color principal.
- [-] Separar el alcance de las variables:
  - `--theme-*` y `--font-*`: identidad editable.
  - `--ds-*`: tokens derivados compartidos.
  - `--game-card-*` y `--game-sheet-*`: estado y geometría local de componentes.
- [-] Migrar gradualmente colores y medidas literales heredados; el lienzo, el texto principal, el acento y el rojo editorial ya apuntan a variables maestras, pero quedan literales legacy por retirar.

## Futuro — Histórico de precios

- [ ] Almacenar una serie temporal equivalente a la gráfica de dinero de SteamDB, conservando como mínimo fecha, precio, descuento, moneda y procedencia.
- [ ] Representar esos datos con una gráfica de lectura financiera: eje temporal, evolución del precio, mínimos, máximos y marcador del precio de compra, con una apariencia similar a una gráfica de compra y venta de acciones.
- [ ] Antes de implementarlo, decidir el mecanismo de obtención y actualización, el modelo persistente y los límites de uso de la fuente.

Esta fase queda documentada para el futuro; no debe implementarse todavía.
