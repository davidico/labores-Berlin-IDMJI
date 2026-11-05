// Guarda la app para que abra rápido y funcione con mala conexión.
const CACHE = 'labores-v65';
const SHELL = ['./', './index.html', './app.js', './go.js', './config.js', './privacy.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './badge.png'];
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // Archivos de la app: primero la red (para recibir mejoras), si no hay red, la copia guardada.
  if (u.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
    return;
  }
  // Librerías y fuentes: la copia guardada primero.
  if (CDN.includes(u.hostname)) {
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});

// Notificaciones al celular
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Labores Berlín', {
    body: d.body || '', icon: 'icon-192.png', badge: 'badge.png', data: { url: d.url || './' },
    // Android: que vibre y suene. En iPhone se usan solo las opciones básicas (el sonido se activa en Ajustes > Notificaciones > Labores > Sonidos).
    ...(/iPhone|iPad|iPod|Macintosh/.test(self.navigator.userAgent) ? {} : { vibrate: [200, 100, 200], tag: 'lb-' + Date.now(), renotify: true })
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if (c.url.startsWith(self.registration.scope)) { c.focus(); return; } }
    return self.clients.openWindow(url);
  }));
});
