const CACHE = 'road2026-v19';
const ASSETS = [
  '/album-fifa-2026/',
  '/album-fifa-2026/index.html',
  '/album-fifa-2026/icon-192.png',
  '/album-fifa-2026/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.matchAll({ type: 'window' }))
     .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/album-fifa-2026/index.html');
      });
    })
  );
});
