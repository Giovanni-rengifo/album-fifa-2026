# Road to 2026 — Álbum Tracker PWA

Tracker de láminas Panini para el FIFA World Cup 2026. PWA instalable, offline-first, mobile-only.

## Reglas de sesión — OBLIGATORIO

- **Al terminar cada sesión**: actualizar este CLAUDE.md con los cambios realizados.
- **Una vez aprobados los cambios**: hacer commit y push inmediatamente.
  ```bash
  git add index.html sw.js
  git commit -m "tipo: descripción corta"
  git push origin main
  ```

## Stack

- **Un solo archivo**: toda la app vive en `index.html` (HTML + CSS inline + JS vanilla)
- **Sin build system**: no npm, no bundler, no TypeScript — editar directamente
- **PWA**: `manifest.json` + `sw.js` para instalación y modo offline
- **Deploy**: GitHub Pages → `https://giovanni-rengifo.github.io/album-fifa-2026/`
- **Repo**: `https://github.com/Giovanni-rengifo/album-fifa-2026`

## Archivos

| Archivo | Rol |
|---|---|
| `index.html` | App completa — CSS, HTML, JS en un archivo |
| `sw.js` | Service Worker — cache offline |
| `manifest.json` | Config PWA — íconos, colores, start_url |
| `icon-192.png` / `icon-512.png` | Íconos de la app instalada |

## Workflow Git

```bash
git add index.html sw.js
git commit -m "tipo: descripción"
git push origin main
# GitHub Pages se actualiza en ~1 min
```

## Service Worker — cache busting OBLIGATORIO

Cada vez que se hagan cambios visuales o de lógica JS, **incrementar el número de versión** en `sw.js`:

```js
const CACHE = 'road2026-v26'; // ← incrementar en cada deploy
```

Sin esto, los usuarios instalados siguen viendo la versión anterior.

### Estructura correcta del SW (no modificar sin razón)
- `skipWaiting()` va al final de la cadena `.then()` dentro de `e.waitUntil()` en `install`
- `clients.claim()` va encadenado dentro de `e.waitUntil()` en `activate`
- **No incluir URLs externas (CDN) en `ASSETS`** — si la CDN falla, el SW no instala

### Si la app no actualiza
Desinstalar la PWA completamente y reinstalar desde la URL. El backup de datos está en la tab Backup.

## Nomenclatura de secciones (UI)

| Sección | Contenido |
|---|---|
| **Sección 1** | Header — título + badge de progreso global |
| **Sección 2** | Barra de búsqueda |
| **Sección 3** | Tab bar — Faltan / Tengo / Repes / Stats / Compartir / Backup / Agregar / Orden |
| **Sección 4** | Grid principal — cards de países (level 1) o láminas (level 2) |
| **Sección 5** | Paginación — `< Pág. X de Y >` |

## Diseño

### Tema actual: Azul
```css
--bg-page: #05101f
--bg-surface: #040c18
--bg-card: #0c1e38
--accent: #60a5fa        /* blue-400 */
--white: oklch(99% 0.005 220)
--black: oklch(8% 0.005 220)
```

### Tokens CSS en `:root`
Todos los colores repetidos usan variables. No agregar colores hard-coded nuevos — usar tokens existentes o agregar al `:root`.

### Font sizes
Usar `rem`, no `px`. Base: 16px. Excepciones puntuales (ej: `22px` para íconos de láminas) son aceptables cuando el usuario especifica un valor exacto.

### Animaciones
- Easing: `var(--ease-out)` para interacciones, `var(--ease-out-expo)` para barras de progreso
- Progress bars: `transform: scaleX()` (no `width`) — GPU composited
- Entry animations en cards: `@keyframes card-enter` con stagger via `--stagger` CSS var
- `prefers-reduced-motion`: ya configurado, anula todas las transiciones

## Sección 3 — Tab Bar

Todos los tabs tienen ícono FA + label de texto. Tamaño ícono: `1.125rem`. Touch target: `min-width:44px`.

| Tab | ID | Ícono | Comportamiento |
|---|---|---|---|
| Faltan | `tab-faltan` | `fa-xmark` | Cambia `S.tab` |
| Tengo | `tab-tengo` | `fa-circle-check` | Cambia `S.tab` |
| Repes | `tab-repes` | `fa-copy` | Cambia `S.tab` |
| Stats | `tab-stats` | `fa-chart-pie` | Cambia `S.tab` |
| Compartir | `tab-share` | `fa-whatsapp` | Cambia `S.tab` |
| Backup | `tab-backup` | `fa-floppy-disk` | Cambia `S.tab` |
| Agregar | `tab-agregar` | `fa-circle-plus` | Cambia `S.tab` |
| **Orden** | `tab-orden` | `fa-sort` | Abre sort panel (NO cambia `S.tab`) |

### Panel de Orden (Sort Panel)
- Bottom sheet `#sort-panel` con 8 opciones en grid 4×2
- Funciones: `toggleSortPanel()`, `openSortPanel()`, `closeSortPanel()`, `applySort(s)`
- `S.sort` posibles valores: `az` | `za` | `pag-asc` | `pag-desc` | `owned-desc` | `owned-asc` | `escudo` | `equipo` | `pct`
- Filtros `escudo` y `equipo` excluyen FWC (`c.code !== 'FWC'`)

## Sección 4 — Cards de países (Level 1)

Sin cambios estructurales. Progress bar, bandera, código, página.

## Sección 4 — Cards de láminas (Level 2)

### Íconos por tipo (`stickerLabel()` retorna HTML)
| Tipo | Lámina | Ícono FA | Color |
|---|---|---|---|
| Escudo | 1 | `fa-shield-halved` | `rgba(253,224,71,.95)` — amarillo eléctrico |
| Arquero | 2 | `fa-hands` | `rgba(185,110,35,.9)` — café eléctrico |
| Equipo | 13 | `fa-users` | `rgba(168,85,247,.95)` — morado eléctrico |
| Jugador | resto | `fa-person-running` | `rgba(148,163,184,.75)` — gris neutro |
| Especial | FWC | `fa-star` | `rgba(251,146,60,.9)` — naranja |

- Tamaño ícono: `22px`
- Clase CSS tipo: `escudo` | `arquero` | `equipo` | `especial` (FWC) — se aplica en el render
- El ícono indica el **tipo**, el borde indica el **estado**

### Sistema de color — estados de card
Fondo unificado para todos: `rgba(232,237,242,0.07)`

| Estado | Clase | Borde | Border-width |
|---|---|---|---|
| Falta | `.falta` | `rgba(239,68,68,.5)` rojo | 1px |
| Tengo | `.tengo` | `rgba(34,197,94,.8)` verde | 2px |
| Repe | `.repe` | `rgba(96,165,250,.8)` azul | 2px |
| Ghost | `.ghost` | `rgba(255,255,255,.06)` dim | 1px |

- **No usar `opacity` en las cards** — opaca íconos y bordes
- No hay fondos tipo-específicos (escudo/arquero/equipo) — todos comparten el mismo fondo

### Ghost Cards (tab Tengo)
- En `getStickerList()`, tab `tengo` retorna TODAS las láminas del país (owned + not owned)
- Láminas no poseídas → clase `ghost`
- Ghost: íconos y número al 20% opacidad, `.repe-ctrl` con `visibility:hidden`
- Lógica: `S.tab==='tengo' && !have` → `'ghost'`

## Estructura JS (en index.html)

### Estado global
```js
var S = {
  level: 1,        // 1=grilla países, 2=láminas de un país
  country: null,   // país seleccionado en level 2
  tab: 'faltan',   // tab activo: faltan|tengo|repes|agregar|stats|share|backup
  page: 0,
  q: '',           // query de búsqueda
  db: {},          // datos de láminas
  sort: 'az'       // az|za|pag-asc|pag-desc|owned-desc|owned-asc|escudo|equipo|pct
}
```

### Países
- 48 países + FWC (especiales). Total: 980 láminas
- Países regulares: láminas 1–20 (`from:1, to:20`)
- FWC: láminas 0–19 (`from:0, to:19`) — 20 láminas, empezando en 00
- `countTotal(c) = c.to - c.from + 1` → siempre 20

### Persistencia
- `localStorage` key: `panini2026`
- `saveDB()` / `initDB()` — carga con migración de formato antiguo

### Tabs disponibles
`faltan` | `tengo` | `repes` | `agregar` | `stats` | `share` | `backup`
(El botón `orden` NO modifica `S.tab`)

### Funciones clave
| Función | Qué hace |
|---|---|
| `render()` | Re-renderiza el grid completo según `S` |
| `changeTab(t)` | Cambia tab, actualiza aria-selected, llama render() |
| `changeRepe(n, val)` | Marca/desmarca lámina o modifica repes |
| `updateGlobal()` | Actualiza badge y barra de progreso global |
| `renderStats()` | Genera vista de estadísticas (muestra `X/20`, no %) |
| `renderShare()` | Genera texto para compartir por WhatsApp |
| `renderBackup()` | Genera UI de export/import JSON |
| `setSort(s)` | Cambia sort y re-renderiza |
| `applySort(s)` | Aplica sort desde panel, cierra panel, re-renderiza |
| `toggleSortPanel()` | Abre/cierra el panel de orden |
| `stickerLabel(c,n)` | Retorna HTML con ícono FA según tipo de lámina |
| `setBadge(id,val)` | — (eliminada, badges removidos) |

## Stats

- **Ranking por completado**: muestra `X/20` (ej: `4/20`), NO porcentaje
- Ordenado por `countOwned` descendente
- FWC muestra ✨ en lugar de bandera

## Accesibilidad (ya implementada)

- Country cards: `<button>` (no div)
- Tabs: `role="tablist"`, `role="tab"`, `aria-selected`
- Toast: `role="status" aria-live="polite"`
- Botones sin texto: `aria-label`
- Íconos decorativos: `aria-hidden="true"`
- Focus: `*:focus-visible` global con outline accent
- Touch targets: `.repe-btn` usa `::after` para 44px, `.nav-btn` es 44px

## Skills disponibles

- `/impeccable` — audit, critique, polish, animate, layout
- `/emil-design-eng` — filosofía de animaciones y micro-interacciones
- `/design-taste-frontend` — rediseño con criterio, anti-genérico
