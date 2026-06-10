# Design

Sistema visual extraído del código real (`index.html`, CSS inline). Tema único oscuro, mobile-only (max-width 480px), un solo archivo sin build.

## Theme

Oscuro permanente. Escena: coleccionista mirando el celular en interiores, a menudo de noche revisando sobres recién abiertos. Azul profundo desaturado de fondo; el color saturado se reserva para estado.

## Color Palette

Tokens en `:root` — no agregar colores hard-coded nuevos; usar tokens o agregarlos al `:root`.

| Token | Valor | Uso |
|---|---|---|
| `--bg-page` | `#05101f` | Fondo de página |
| `--bg-surface` | `#040c18` | Header / superficies elevadas hacia atrás |
| `--bg-card` | `#0c1e38` | Cards, inputs, tab bar |
| `--bg-hover` | `#0f2548` | Hover de cards |
| `--border` | `#1e3d6e` | Borde estándar |
| `--border-soft` | `#0f2236` | Divisores suaves |
| `--border-tabs` | `#192f55` | Borde de tab bar |
| `--accent` | `#60a5fa` | Azul de marca (blue-400). Progreso, links, chips activos |
| `--white` | `oklch(99% 0.005 220)` | Texto principal (blanco tintado al hue de marca) |
| `--black` | `oklch(8% 0.005 220)` | Texto sobre acento |
| `--text-muted` | `#93afc8` | Texto secundario |
| `--text-dim` | `#5c7d9a` | Metadatos |
| `--text-dimmer` | `#3a5470` | Placeholders, hints |
| `--green` | `#22c55e` | Estado "tengo" / confirmar |
| `--green-bright` | `#4ade80` | Acentos verdes brillantes |
| `--red` | `#f87171` | Estado "falta" / rechazar |

### Colores semánticos de estado (sticker cards)

Fondo unificado `rgba(232,237,242,0.07)`; el **borde** comunica el estado:

- Falta: borde `rgba(239,68,68,.5)` 1px
- Tengo: borde `rgba(34,197,94,.8)` 2px
- Repe: borde `rgba(96,165,250,.8)` 2px
- Ghost: borde `rgba(255,255,255,.06)`, contenido al 20%
- En canje (deal): ámbar `#fbbf24` / `rgba(251,191,36,.18)`

### Colores de tipo de lámina (íconos FA, 22px)

- Escudo: `rgba(253,224,71,.95)` amarillo
- Arquero: `rgba(185,110,35,.9)` café
- Equipo: `rgba(168,85,247,.95)` morado
- Jugador: `rgba(148,163,184,.75)` gris
- Especial FWC: `rgba(251,146,60,.9)` naranja

## Typography

- Stack: `system-ui, sans-serif`. Sin webfonts.
- Tamaños en `rem` (base 16px). Excepciones puntuales en px solo cuando el usuario especifica valor exacto.
- Jerarquía por peso: 900 para títulos/códigos/badges, 700 para labels, 400 para cuerpo.
- Labels de UI muy pequeños (0.5625rem–0.6875rem) con `letter-spacing` positivo cuando van en mayúsculas.

## Components

- **Tab bar**: 9 tabs con ícono FA 1.125rem + label 0.5625rem; `overflow-x:auto`; tab activo con fondo de color por sección (`active-faltan` rojo oscuro, `active-tengo` verde oscuro, etc.).
- **Country card**: `<button>`, border-radius 12px, bandera circular 34px, código, página, barra de progreso, contador, badge `GRP X`. Altura de fila calculada en JS para llenar el viewport exacto.
- **Sticker card**: border-radius 10px, número + ícono de tipo arriba, control `− ⇄ +` abajo.
- **Sort quick bar**: chips de 34×30px, radio 10px, activo = tinte de acento al 15%.
- **Progress bars**: `transform:scaleX()` (GPU), nunca `width`. Fondo `rgba(0,0,0,.4)`, fill verde o gradiente azul (solo el global).
- **Toast**: píldora flotante acento sobre `--black`, `aria-live=polite`.
- **Botones de acción** (`.share-btn`): full-width, radio generoso, verde para confirmar, rojo translúcido para destruir.

## Layout

- `100dvh`, flex column: header sticky → main (flex:1, overflow-y:auto) → footer paginación.
- Grid países: 4 columnas, 16 por página, row height dinámico calculado contra `main.clientHeight` (regla: el grid nunca scrollea).
- Grid láminas: 20 por página (todas las del país), `minmax(68px,1fr)`.
- Vistas Grupos: `position:absolute;inset:0` dentro de contenedor relativo para que `repeat(n,1fr)` resuelva.
- Gaps: 4px en grids densos, 6px en grupos, 8px en listas.

## Motion

- Easing: `--ease-out: cubic-bezier(0.23,1,0.32,1)` para interacciones; `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)` para barras de progreso.
- Entrada de cards: `card-enter` (fade + 8px up) con stagger `calc(var(--stagger)*10ms)`.
- Paginación direccional: `slide-from-right` / `slide-from-left` (22px) según `#grid[data-dir]`.
- Vista Grupos: `grupos-enter` fade puro, sin desplazamiento ni stagger (todo cabe en una pantalla).
- Tap feedback: `transform:scale(.95)` en `:active`.
- `prefers-reduced-motion`: anula todas las transiciones y animaciones.

## Reglas duras

- No `opacity` en cards (apaga íconos y bordes); usar colores con alpha.
- No `grid.style.display='none'` en el bloque inicial de `render()` (flicker).
- No animar propiedades de layout.
- Bump de versión en `sw.js` en cada deploy.
