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
const CACHE = 'road2026-v40'; // ← incrementar en cada deploy
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
| **Sección 3** | Tab bar — Faltan / Tengo / Repes / **Canje** / Stats / Compartir / Backup / Agregar |
| **Sección 3.5** | Barra de acceso rápido sort (`#sort-quick`) — chips de íconos solo, entre tabs y grid |
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

### Animación direccional de paginación
Las cards se deslizan de derecha a izquierda (→ siguiente) o izquierda a derecha (← anterior):
```css
@keyframes slide-from-right{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes slide-from-left{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:translateX(0)}}
#grid[data-dir="next"] .country-card{animation-name:slide-from-right}
#grid[data-dir="prev"] .country-card{animation-name:slide-from-left}
```
- Variable `_pageDir` (global): `-1` prev, `0` neutro, `1` next — se resetea a 0 en cada render
- `grid.dataset.dir` se asigna antes de limpiar `grid.innerHTML`
- **NUNCA hacer `grid.style.display='none'` en el bloque inicial de render()** — causa flicker. Solo se oculta en los early returns de tabs no-grid (stats, share, backup, canje, agregar)

## Sección 3 — Tab Bar

Todos los tabs tienen ícono FA + label de texto. Tamaño ícono: `1.125rem`. Touch target: `min-width:44px`.
La tab bar tiene `overflow-x:auto` — los 3 últimos tabs son accesibles con scroll horizontal.

| Tab | ID | Ícono | Comportamiento |
|---|---|---|---|
| **Grupos** | `tab-grupos` | `fa-border-all` | Cambia `S.tab` — vista de grupos A-L |
| Faltan | `tab-faltan` | `fa-xmark` | Cambia `S.tab` |
| Tengo | `tab-tengo` | `fa-circle-check` | Cambia `S.tab` |
| Repes | `tab-repes` | `fa-copy` | Cambia `S.tab` |
| **Canje** | `tab-canje` | `fa-right-left` | Cambia `S.tab` |
| Stats | `tab-stats` | `fa-chart-pie` | Cambia `S.tab` |
| *(scroll)* Compartir | `tab-share` | `fa-whatsapp` | Cambia `S.tab` |
| *(scroll)* Backup | `tab-backup` | `fa-floppy-disk` | Cambia `S.tab` |
| *(scroll)* Agregar | `tab-agregar` | `fa-circle-plus` | Cambia `S.tab` |

> **`tab-orden` fue eliminado** — el sort panel todavía existe en DOM (`#sort-panel`) pero ya no hay botón en la tab bar para abrirlo. El acceso rápido al sort se hace desde la Sección 3.5.

## Tab Grupos — Arquitectura

Vista jerárquica de 3 niveles, sin paginación ni footer en ningún nivel.

### Flujo de navegación
1. `S.tab==='grupos'` + `S.groupSel===null` → **Tiles de grupos** (12 tiles A-L, grid 3 columnas)
2. Tap en un grupo → `S.groupSel='A'` → **4 países del grupo** (grid 2 columnas, llena pantalla)
3. Tap en un país → `S.level=2`, `S.country=c` → **20 láminas** (igual que level 2 regular, pero muestra TODAS sin filtrar por tab)

### Diferencias con level 2 regular
- `getStickerListAll(c)` — retorna todos los `from..to` sin filtrar por `owned`/`repes`
- Estado de cada card: `rep>0 → repe`, `have → tengo`, else `falta` (sin ghost cards)
- Deal button va siempre a `DEAL.give` (S.tab==='grupos' no es 'faltan')
- Footer siempre oculto

### Estado nuevo en S
```js
S.groupSel = null; // null o 'A'..'L' — grupo seleccionado en vista Grupos
```

### Navegación atrás (`goBack`)
```js
if(S.tab==='grupos'){
  if(S.level===2) → S.level=1, S.country=null  // láminas → 4 países
  else if(S.groupSel) → S.groupSel=null          // 4 países → tiles de grupos
}
```

### `changeTab()` — lógica especial para grupos
Cuando se navega A grupos desde level 2, se auto-asigna `S.groupSel = S.country.group`.

### Tiles de grupos (nivel 0)
Cada tile muestra: letra grande, 4 mini-banderas (16px), barra de progreso, contador `X/80`.
CSS: `.group-tile`, `.group-letter`, `.group-mini-flags`, `.group-prog-bar`, `.group-count`.

### Cards de países en grupo (nivel 1)
Grid 2×2 que llena la pantalla con `grid-auto-rows:1fr`.
Cards con bandera grande (54px), código, nombre, barra de progreso, `X/20`.
CSS: `.grupo-country-card`, `.grupo-flag-circle`, `.grupo-country-name`, `.grupo-prog-bar`.

### Sort quick bar
Oculta en el tab Grupos (`'grupos'` está en la lista de exclusión de `renderSortQuick()`).

### FWC en Grupos
FWC no tiene `group`, por lo que no aparece en ningún tile ni en la vista de grupos.

## Sección 3.5 — Sort Quick Bar (`#sort-quick`)

Fila de chips de íconos entre la tab bar y el grid. **Solo se muestra en level 1** y cuando el tab activo es `faltan`, `tengo` o `repes`.

```css
#sort-quick{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:8px;flex-shrink:0}
.sq-chip{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:34px;height:30px;
  border-radius:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer}
.sq-chip.active{background:rgba(96,165,250,.15);border-color:var(--accent);color:var(--accent)}
```

**6 chips (solo íconos, sin texto):**

| # | Ícono | Sort | Comportamiento |
|---|---|---|---|
| 1 | `fa-arrow-down-a-z` / `fa-arrow-down-z-a` | `az` ↔ `za` | Toggle |
| 2 | `fa-arrow-down-1-9` / `fa-arrow-down-9-1` | `pag-asc` ↔ `pag-desc` | Toggle |
| 3 | `fa-shield-halved` | `escudo` | Simple |
| 4 | `fa-hands` | `arquero` | Simple |
| 5 | `fa-users` | `equipo` | Simple |
| 6 | `fa-layer-group` | `grupo` | Simple |

Los chips de toggle muestran el ícono del estado actual (via `TOGGLE_CFG`). Función: `renderSortQuick()`.

### `closeSortPanel()` — null guard obligatorio
El tab-orden fue eliminado del DOM. `closeSortPanel()` hace null check antes de acceder:
```js
function closeSortPanel(){
  document.getElementById('sort-panel').style.display='none';
  var t=document.getElementById('tab-orden'); if(t) t.classList.remove('tab-sort-on');
}
```

### Sort panel (legacy — accesible desde `#sort-panel` en DOM)

Bottom sheet — todavía funcional si se llama `openSortPanel()` directamente. Botones toggle y simples:

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
- **Efecto secundario útil**: `.repe-ctrl { visibility:hidden }` en ghost cards también oculta automáticamente el botón de deal sin lógica extra

### Botón de Deal en cards de láminas (Level 2)
El bloque de control de cada lámina tiene **3 botones**: `−` | `⇄ (deal)` | `+`
- Se eliminó el texto del contador entre `−` y `+`; el botón deal ocupa ese espacio central
- `⇄` activo (en deal): clase `in-deal` → fondo ámbar, color `#fbbf24`
- En tab **Faltan**: agrega/quita de `DEAL.want` (quiero recibir)
- En tab **Tengo** o **Repes**: agrega/quita de `DEAL.give` (voy a dar)
- El botón no aparece en ghost cards (oculto via `visibility:hidden` de `.repe-ctrl`)

```css
.repe-btn.deal{background:rgba(96,165,250,.07);color:var(--text-dim)}
.repe-btn.deal:hover{background:rgba(96,165,250,.2);color:var(--accent)}
.repe-btn.deal.in-deal{background:rgba(251,191,36,.18);color:#fbbf24}
```

## Estructura JS (en index.html)

### Estado global
```js
var S = {
  level: 1,        // 1=grilla países, 2=láminas de un país
  country: null,   // país seleccionado en level 2
  tab: 'faltan',   // tab activo: grupos|faltan|tengo|repes|canje|agregar|stats|share|backup
  page: 0,
  q: '',           // query de búsqueda
  db: {},          // datos de láminas
  sort: 'az',      // az|za|pag-asc|pag-desc|owned-desc|owned-asc|escudo|arquero|equipo|grupo|pct
  groupSel: null   // null o 'A'..'L' — grupo seleccionado en vista Grupos
}

var _pageDir = 0;  // dirección de paginación: -1=prev, 0=neutro, 1=next — se resetea en render()

var DEAL = {       // estado transiente del canje (NO se persiste en localStorage)
  give: [],        // [{code, n}] — láminas que voy a dar (tab Tengo/Repes)
  want: []         // [{code, n}] — láminas que quiero recibir (tab Faltan)
};
```

**`DEAL` es in-memory solamente.** Al confirmar (`confirmDeal()`), los cambios se aplican a `S.db` y se guardan. Al rechazar (`clearDeal()`), se limpia sin persistir.

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
`faltan` | `tengo` | `repes` | `canje` | `agregar` | `stats` | `share` | `backup`

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
| `renderCanje()` | Genera vista de canje (Posible Canje / Posible Intercambio) |
| `renderSortQuick()` | Renderiza los chips de sort rápido en `#sort-quick` |
| `applySort(s)` | Aplica sort simple, cierra sort panel |
| `applyToggleSort(a,b)` | Alterna sort entre dos valores |
| `openSortPanel()` | Abre panel y actualiza íconos/labels de toggles |
| `closeSortPanel()` | Cierra panel — tiene null guard para `tab-orden` eliminado |
| `toggleDeal(code,n)` | Agrega/quita lámina del DEAL (give o want según tab) + re-render |
| `removeDealItem(code,n,listType)` | Quita lámina del DEAL desde vista Canje → llama `renderCanje()` |
| `confirmDeal()` | Aplica deal: marca want como owned, descuenta give. Guarda y vuelve a Faltan |
| `clearDeal()` | Limpia DEAL sin persistir. Toast "Canje rechazado" |
| `stickerLabel(c,n)` | Retorna HTML con ícono FA según tipo de lámina |
| `nextPage()` | Avanza página solo si `next-btn` no está disabled — evita animación falsa |
| `prevPage()` | Retrocede página solo si `prev-btn` no está disabled — evita animación falsa |
| `getStickerListAll(c)` | Retorna todos los números `from..to` sin filtrar (usado en vista Grupos level 2) |
| `selectGroup(g)` | Asigna `S.groupSel=g` y llama `render()` |
| `enterGrupoCountry(code)` | Asigna `S.country`, `S.level=2` y llama `render()` desde vista Grupos |
| `renderGruposView()` | Renderiza tiles de grupos (level 0) o 4 países (level 1) en `#grupos-view` |

## Tab Canje — Arquitectura

### Flujo de uso
1. Usuario navega a tab **Faltan** → toca ⇄ en láminas que quiere **recibir** → van a `DEAL.want`
2. Usuario navega a tab **Tengo** o **Repes** → toca ⇄ en láminas que va a **dar** → van a `DEAL.give`
3. Usuario va a tab **Canje** → ve ambas listas, puede quitar ítems, confirmar o rechazar

### Vista Canje (renderCanje)
Dos secciones diferenciadas con bordes de color:

| Sección | Borde | Fondo | Icono | Descripción |
|---|---|---|---|---|
| **POSIBLE CANJE** (arriba) | verde `rgba(34,197,94,.45)` | `rgba(34,197,94,.04)` | `fa-arrow-down-to-bracket` | "Láminas que voy a recibir" |
| **POSIBLE INTERCAMBIO** (abajo) | ámbar `rgba(251,191,36,.45)` | `rgba(251,191,36,.04)` | `fa-arrow-up-from-bracket` | "Láminas que voy a dar" |

### Botones de acción (aparecen solo si hay ítems en alguna lista)
- **Confirmar Canje** (`share-btn green`, `flex:1`): aplica el deal
- **Rechazar** (rojo, `flex:0 0 auto`, `width:auto`): limpia el deal

> **CRÍTICO**: El botón rechazar necesita `width:auto` inline — la clase `.share-btn` tiene `width:100%` que con `flex:0 0 auto` (flex-basis:auto) se comporta como un valor de flex-basis y expande el botón al 100% del contenedor. `width:auto` inline lo sobreescribe.

### Cada ítem del deal muestra
Bandera (22px) + código + ícono tipo lámina + número + botón quitar (×)

```css
.canje-item{display:flex;align-items:center;gap:8px;background:var(--bg-page);
  border:1px solid var(--border);border-radius:8px;padding:7px 10px}
.canje-remove{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
  border-radius:6px;color:var(--red);cursor:pointer;min-width:30px;min-height:30px;
  display:flex;align-items:center;justify-content:center}
```

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

### Parpadeo (flicker) al cambiar de página
**Causa**: Al inicio de cada `render()` se hacía `grid.style.display='none'` para ocultar el grid, causando un reflow/repaint visible en cada re-render — incluyendo paginación.
**Solución**: Eliminar esa línea del bloque inicial. El grid se oculta **solo** en los early returns de tabs no-grid (`stats`, `share`, `backup`, `canje`, `agregar`). Para las vistas de grid, simplemente se sobreescribe `grid.innerHTML` directamente.

### Animación falsa al llegar al límite de páginas
**Causa**: `nextPage()` y `prevPage()` llamaban `render()` incluso si `S.page` ya estaba en el máximo/mínimo (el cap ocurría dentro de `render()` pero la animación ya se había triggerado).
**Solución**: Chequear si el botón de navegación está `disabled` antes de actuar:
```js
function nextPage(){if(document.getElementById('next-btn').disabled)return; _pageDir=1; S.page++; render();}
function prevPage(){if(document.getElementById('prev-btn').disabled)return; _pageDir=-1; S.page--; render();}
```

### `closeSortPanel()` lanzaba error tras eliminar tab-orden
**Causa**: `document.getElementById('tab-orden').classList.remove(...)` — cuando el elemento no existe en el DOM, `.classList` falla con TypeError.
**Solución**: Null guard: `var t=document.getElementById('tab-orden'); if(t) t.classList.remove('tab-sort-on');`

### Botón "Rechazar" en Canje se expandía a 456px de ancho
**Causa**: La clase `.share-btn` tiene `width:100%`. Con `flex:0 0 auto` (flex-basis:auto), el `width:100%` actúa como flex-basis y expande el botón al 100% del contenedor flex.
**Solución**: Agregar `width:auto` inline en el botón rechazar para sobreescribir el CSS de la clase.

### Botones "quitar" en lista Canje eran demasiado pequeños (16×20px)
**Causa**: `.canje-remove` no tenía min-size explícito, solo padding mínimo.
**Solución**: `min-width:30px; min-height:30px; display:flex; align-items:center; justify-content:center`

## Estado actual del proyecto

- **SW versión**: `road2026-v45`
- **Grid**: 4 columnas, `PER_PAGE = 16`
- **Tab bar**: 9 tabs — **Grupos** / Faltan / Tengo / Repes / Canje / Stats / *(scroll)* Compartir / Backup / Agregar
- **Sort quick bar**: 6 chips de íconos entre tabs y grid — A↕Z, Pág.↕, Escudo, Arquero, Equipo, Grupo (oculto en tab Grupos)
- **Feature Grupos**: vista jerárquica 3 niveles — tiles A-L → 4 países → 20 láminas completas
- **Feature Canje**: deal button en cards de láminas, vista Canje con Posible Canje (verde) + Posible Intercambio (ámbar), flujo confirmar/rechazar
- **Paginación**: animación direccional (slide-from-right / slide-from-left) sin flicker ni animación falsa en límites
- **Grupos A-L**: implementados en datos y UI (badge `GRP X` en cards)
- **Badge repes**: `font-size: 13px` (mejorado de 9px)

## Skills disponibles

- `/impeccable` — audit, critique, polish, animate, layout
- `/emil-design-eng` — filosofía de animaciones y micro-interacciones
- `/design-taste-frontend` — rediseño con criterio, anti-genérico
