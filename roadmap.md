# Roadmap — NooVDB

Leyenda: `[x]` hecho · `[-]` parcial · `[ ]` pendiente.

## Nombres canónicos

| Concepto de producto | Nombre visible | Nombre en código | Regla |
|---|---|---|---|
| Aplicación | **NooVDB** | paquete `noovdb` | `Personal Database` es el descriptor, no un segundo nombre. |
| Tarjeta del catálogo | **Game Card** | `CatalogGameCard.astro`, `.game-card`, `[data-game-card]` | Al activarla abre la Game Sheet del juego. |
| Variante con todos los logros | **Game Card Golden** | `data-game-card-variant="golden"`, `.is-golden` | Es una variante de Game Card, no un componente distinto. Lleva el efecto foil. |
| Página individual del juego | **Game Sheet** / **Ficha técnica** | `src/pages/games/[slug].astro`, módulos `GameDetail*` | “Ficha técnica” es el texto en español; `Game Sheet` es el concepto de producto. |

## Visual Updates

- [x] Game Card: overlay informativo al hover/foco y tilt de hasta 3° siguiendo el puntero.
- [x] Game Card Golden: brillo foil siguiendo la posición del puntero.
- [x] Accesibilidad de movimiento: tilt y foil desactivados con `prefers-reduced-motion` o sin puntero preciso.
- [x] Game Sheet · Horas: composición recurrente alineada con la captura objetivo; `Periodo` ocupa tres columnas y la gráfica se une al bloque superior.

## Variables Updates

- [x] Variables maestras de tipografía:
  - `--font-title`: Unbounded.
  - `--font-text`: Space Grotesk.
  - `--font-numbers`: Space Grotesk, independiente del texto para poder sustituirla sin afectar la UI.
- [x] Variables maestras de color:
  - `--brand-dark`: negro/material base.
  - `--brand-light`: blanco/texto y contraste.
  - `--brand-purple`: acento de marca y sus matices derivados.
- [x] Convención de variables:
  - `--brand-*` y `--font-*`: únicas entradas editables de identidad.
  - `--ds-*`: tokens derivados y reutilizables del sistema visual.
  - `--game-card-*` y `--game-sheet-*`: estado o geometría local de un componente.
- [-] Migrar los colores y medidas literales heredados de todas las pantallas a tokens. La base, el shell y el catálogo ya usan el sistema; aún quedan estilos antiguos en la Game Sheet y otras vistas.

## Futuro — Histórico de precios

- [ ] Almacenar una serie temporal de precios equivalente a la gráfica de dinero de SteamDB, conservando como mínimo fecha, precio, descuento, moneda y procedencia.
- [ ] Diseñar la gráfica de dinero con lectura de mercado financiero —eje temporal, evolución del precio, mínimo/máximo y marcador del precio de compra— para que visualmente recuerde a una gráfica de compra y venta de acciones.
- [ ] Antes de implementarlo, decidir el mecanismo de obtención y actualización de datos, el modelo persistente y los límites de uso de la fuente. Esta fase queda documentada, no implementada ahora.
