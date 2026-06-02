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
const CACHE = 'road2026-v35'; // ← incrementar en cada deploy
```

**CRÍTICO**: Si se modifica `index.html` sin actualizar `sw.js`, los usuarios con la PWA instalada siguen viendo la versión anterior en caché.

### Estrategia de caché (SW v31+)

**Network-first para HTML, cache-first para assets estáticos:**

```js
// HTML → siempre fresco desde la red
if (e.request.mode === 'navigate') {
  fetch(e.request).catch(() => caches.match('/album-fifa-2026/index.html'))
}
// Íconos → cache-first (no cambian)
caches.match(e.request).then(cached => cached || fetch(e.request))
```

Esto resuelve el problema histórico de actualizaciones que no llegaban a usuarios con PWA instalada. Con network-first, el HTML siempre se sirve fresco cuando hay conexión; el caché solo se usa offline.

### Estructura correcta del SW (no modificar sin razón)
- `skipWaiting()` va al final de la cadena `.then()` dentro de `e.waitUntil()` en `install`
- `clients.claim()` va encadenado dentro de `e.waitUntil()` en `activate`
- **No incluir URLs externas (CDN) en `ASSETS`** — si la CDN falla, el SW no instala

### Si la app no actualiza
Con SW v31+ esto ya no debería ocurrir (network-first). Si persiste: desinstalar la PWA y reinstalar desde la URL. El backup de datos está en la tab Backup.

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

Bottom sheet `#sort-panel` — **7 opciones** en grid 3×2 + Grupo full-width.

#### Botones toggle (alternan dirección al tocarse de nuevo)
| Botón | Alterna entre | Atributos HTML |
|---|---|---|
| A→Z / Z→A | `az` ↔ `za` | `data-toggle-a="az" data-toggle-b="za"` |
| Pág.↑ / Pág.↓ | `pag-asc` ↔ `pag-desc` | `data-toggle-a="pag-asc" data-toggle-b="pag-desc"` |
| Más lám. / Menos lám. | `owned-desc` ↔ `owned-asc` | `data-toggle-a="owned-desc" data-toggle-b="owned-asc"` |

El ícono y label del botón se actualizan dinámicamente al abrir el panel (ver `TOGGLE_CFG` en JS y `openSortPanel()`).

#### Botones simples (contextuales por tab)
| Botón | Sort value | Tab Faltan | Tab Tengo | Tab Repes |
|---|---|---|---|---|
| Escudos | `escudo` | Países sin escudo (#1) | Países con escudo | Países con escudo repetido |
| Arqueros | `arquero` | Países sin arquero (#2) | Países con arquero | Países con arquero repetido |
| Equipos | `equipo` | Países sin equipo (#13) | Países con equipo | Países con equipo repetido |
| **Grupo** | `grupo` | Ordena A→B→...→L | igual | igual |

Todos excluyen FWC. El sort `grupo` ordena alfabéticamente por letra de grupo (A-L), FWC al final.

#### Funciones del sort panel
| Función | Qué hace |
|---|---|
| `toggleSortPanel()` | Abre/cierra el panel |
| `openSortPanel()` | Abre, actualiza íconos/labels de toggles, marca active |
| `closeSortPanel()` | Cierra, quita highlight de tab-orden |
| `applySort(s)` | Aplica sort simple, cierra panel |
| `applyToggleSort(a,b)` | Alterna entre a y b según `S.sort` actual |

#### `S.sort` posibles valores
`az` | `za` | `pag-asc` | `pag-desc` | `owned-desc` | `owned-asc` | `escudo` | `arquero` | `equipo` | `grupo` | `pct`

## Sección 4 — Cards de países (Level 1)

**Grid: 4 columnas** (`repeat(4,1fr)`), `PER_PAGE = 16` (múltiplo de 4 → sin celdas vacías).

### Lógica de altura de filas (JS inline en render)
```js
var rowCount = Math.ceil(slice.length / 4);
grid.style.gridAutoRows = rowCount >= 4 ? 'minmax(68px,1fr)' : 'minmax(68px,110px)';
```
- ≥4 filas (página completa): `1fr` → llenan la pantalla
- <4 filas (búsqueda con pocos resultados): cappadas a 110px → sin estiramiento

### Contenido de la card
- Bandera (flag-circle, 34px)
- Código del país (bold)
- Pág. X
- Barra de progreso
- X/20 (contador)
- **Badge de grupo** `GRP X` — solo en level 1, no en láminas

### Badge de grupo
```css
.country-group { font-size:0.75rem; font-weight:900; background:rgba(96,165,250,.15);
  color:var(--accent); border:1px solid rgba(96,165,250,.3);
  border-radius:5px; padding:3px 8px; margin-top:5px; }
```
Renderizado condicionalmente: `c.group ? '<div class="country-group">GRP '+c.group+'</div>' : ''`
FWC no tiene grupo → no muestra badge.

### Datos de grupos (objeto `GROUPS` en JS)
```js
var GROUPS = {
  'MEX':'A','RSA':'A','KOR':'A','CZE':'A',
  'CAN':'B','BIH':'B','QAT':'B','SUI':'B',
  'BRA':'C','MAR':'C','HAI':'C','SCO':'C',
  'USA':'D','PAR':'D','AUS':'D','TUR':'D',
  'GER':'E','CUW':'E','CIV':'E','ECU':'E',
  'NED':'F','JPN':'F','SWE':'F','TUN':'F',
  'BEL':'G','EGY':'G','IRN':'G','NZL':'G',
  'ESP':'H','CPV':'H','KSA':'H','URU':'H',
  'FRA':'I','SEN':'I','IRQ':'I','NOR':'I',
  'ARG':'J','ALG':'J','AUT':'J','JOR':'J',
  'POR':'K','COD':'K','UZB':'K','COL':'K',
  'ENG':'L','CRO':'L','GHA':'L','PAN':'L'
};
```
Se inyecta en COUNTRIES via `.map()`: `group: GROUPS[c.code] || ''`

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

### Badge de repetidas (`.repe-badge`)
```css
.repe-badge { font-size: 13px; font-weight:900; /* era 9px */ }
```
Muestra `+N` en esquina superior derecha cuando hay repetidas.

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
  sort: 'az'       // az|za|pag-asc|pag-desc|owned-desc|owned-asc|escudo|arquero|equipo|grupo|pct
}
```

### Países
- 48 países + FWC (especiales). Total: 980 láminas
- Países regulares: láminas 1–20 (`from:1, to:20`)
- FWC: láminas 0–19 (`from:0, to:19`) — 20 láminas, empezando en 00
- `countTotal(c) = c.to - c.from + 1` → siempre 20
- Cada país tiene campo `group` (letra A-L, o `''` para FWC)

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
| `applySort(s)` | Aplica sort simple desde panel |
| `applyToggleSort(a,b)` | Alterna sort entre dos valores |
| `openSortPanel()` | Abre panel y actualiza íconos/labels de toggles |
| `stickerLabel(c,n)` | Retorna HTML con ícono FA según tipo de lámina |

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

## Problemas conocidos y soluciones aplicadas

### SW no actualizaba en usuarios con PWA instalada
**Causa**: Estrategia cache-first servía el HTML viejo indefinidamente. Agravado por commits que modificaban `index.html` sin bumear `sw.js`.
**Solución**: SW v31 — cambio a network-first para requests de navegación. El HTML siempre se sirve fresco si hay red; caché solo para offline.
**Regla**: Igual hay que bumear `sw.js` en cada commit, pero ya no es la única barrera.

### Cards estiradas con 4 columnas
**Causa**: Al pasar de 3 a 4 columnas, `grid-auto-rows:1fr` distribuía la altura disponible entre menos filas (4 en vez de 5), haciendo cada card más alta.
**Solución**: `PER_PAGE = 16` (múltiplo de 4, sin celdas vacías) + threshold `rowCount >= 4` para activar `1fr`.

### Sort escudo/equipo no era contextual
**Causa**: Filtraban siempre por `!owned` (faltantes) sin importar el tab activo.
**Solución**: Los sorts de tipo de lámina ahora leen `S.tab` y filtran según contexto: `faltan`→ sin esa lámina, `tengo`→ con esa lámina, `repes`→ con esa lámina repetida.

## Estado actual del proyecto

- **SW versión**: `road2026-v35`
- **Grid**: 4 columnas, `PER_PAGE = 16`
- **Sort panel**: 7 opciones — 3 toggles (A↕Z, Pág.↕, Láminas↕) + Escudos/Arqueros/Equipos (contextuales) + Grupo (full-width)
- **Grupos A-L**: implementados en datos y UI (badge `GRP X` en cards)
- **Badge repes**: `font-size: 13px` (mejorado de 9px)

## Skills disponibles

- `/impeccable` — audit, critique, polish, animate, layout
- `/emil-design-eng` — filosofía de animaciones y micro-interacciones
- `/design-taste-frontend` — rediseño con criterio, anti-genérico
