# Road to 2026 — Álbum Tracker PWA

Tracker de láminas Panini para el FIFA World Cup 2026. PWA instalable, offline-first, mobile-only.

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
# Editar index.html (y sw.js si cambia cache)
git add index.html sw.js
git commit -m "tipo: descripción"
git push origin main
# GitHub Pages se actualiza en ~1 min
```

## Service Worker — cache busting OBLIGATORIO

Cada vez que se hagan cambios visuales o de lógica JS, **incrementar el número de versión** en `sw.js`:

```js
// sw.js línea 1 — cambiar el número cada deploy
const CACHE = 'road2026-v17'; // ← incrementar
```

Sin esto, los usuarios instalados siguen viendo la versión anterior. Siempre hacer esto antes del commit final.

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
Usar `rem`, no `px`. Base: 16px.

### Animaciones
- Easing: `var(--ease-out)` para interacciones, `var(--ease-out-expo)` para barras de progreso
- Progress bars: `transform: scaleX()` (no `width`) — GPU composited
- Entry animations en cards: `@keyframes card-enter` con stagger via `--stagger` CSS var
- `prefers-reduced-motion`: ya configurado, anula todas las transiciones

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
  sort: 'az'
}
```

### Países
- 48 países + FWC (especiales). Total: 980 láminas
- Países regulares: láminas 1–20
- FWC: láminas 0–19
- Lámina 1 = Escudo (azul), 2 = Arquero (teal), 13 = Equipo (morado), resto = Jugadores

### Persistencia
- `localStorage` key: `panini2026`
- `saveDB()` / `initDB()` — carga con migración de formato antiguo

### Tabs disponibles
`faltan` | `tengo` | `repes` | `agregar` | `stats` | `share` | `backup`

### Funciones clave
| Función | Qué hace |
|---|---|
| `render()` | Re-renderiza el grid completo según `S` |
| `changeTab(t)` | Cambia tab, actualiza aria-selected, llama render() |
| `changeRepe(n, val)` | Marca/desmarca lámina o modifica repes |
| `updateGlobal()` | Actualiza badge y barra de progreso global |
| `renderStats()` | Genera vista de estadísticas |
| `renderShare()` | Genera texto para compartir por WhatsApp |
| `renderBackup()` | Genera UI de export/import JSON |

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
