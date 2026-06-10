# Product

## Register

product

## Users

Coleccionistas del álbum Panini FIFA World Cup 2026. Caso principal: el dueño del álbum revisando su colección desde el celular — en casa abriendo sobres, o cara a cara con otro coleccionista negociando un canje. Una sola mano, pantalla pequeña, sesiones cortas y frecuentes. La app es mobile-only e instalada como PWA; se usa también offline.

## Product Purpose

Registrar qué láminas faltan, cuáles se tienen y cuáles están repetidas (980 láminas: 48 países + FWC). Facilitar el canje: armar listas de "doy/recibo", confirmar intercambios, compartir faltantes por WhatsApp. Éxito = encontrar cualquier lámina en menos de 3 taps y cerrar un canje sin fricción.

## Brand Personality

Limpia, eficiente, sobria. Es una herramienta de gestión personal, no un juego ni una experiencia de marca. La emoción la pone el álbum físico; la app pone la claridad. Tono directo, en español, sin adornos.

## Anti-references

- Dashboard corporativo: tablas densas, KPIs fríos, estética de oficina, jerga de negocio.
- Sobrecarga visual: la app vive en pantallas de 360–412px; cada elemento compite por espacio escaso.

## Design Principles

1. **Velocidad de consulta**: el estado de cualquier lámina se lee de un vistazo (color de borde = estado, ícono = tipo). Nunca esconder información de estado detrás de un tap.
2. **Una pantalla, sin scroll**: las vistas de grid llenan exactamente el viewport. El scroll vertical en el grid es un bug, no una feature.
3. **Tap-first**: targets de 44px, acciones primarias alcanzables con el pulgar, sin hover-dependencias.
4. **Sobriedad funcional**: el color comunica estado (rojo=falta, verde=tengo, azul=repe, ámbar=canje), nunca decora. Sin gradientes decorativos ni efectos gratuitos.
5. **Offline y persistente**: nada se pierde; localStorage + backup explícito. Las acciones destructivas (rechazar canje, importar backup) siempre confirman o avisan.

## Accessibility & Inclusion

- Touch targets mínimo 44×44px (ya implementado via `::after` en botones pequeños).
- `prefers-reduced-motion` anula todas las transiciones.
- Roles ARIA en tabs, toast con `aria-live`, botones sin texto con `aria-label`.
- `*:focus-visible` global con outline de acento.
- Contraste: texto principal sobre fondos oscuros debe mantener AA; los text-dim/dimmer son solo para metadatos no críticos.
