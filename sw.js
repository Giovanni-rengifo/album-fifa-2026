const CACHE = 'road2026-v27';
const ASSETS = [
  '/album-fifa-2026/',
  '/album-fifa-2026/index.html',
  '/album-fifa-2026/icon-192.png',
  '/album-fifa-2026/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => {
        try { client.navigate(client.url); } catch(e) {}
      }))
  );
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
