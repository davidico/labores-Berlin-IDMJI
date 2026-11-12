// Guarda la app para que abra rápido y funcione con mala conexión.
const CACHE = 'labores-v87';
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
    // Se guarda solo lo que llegó bien, sin la parte ?… de la dirección (así no se llena de copias) y nunca version.json.
    const key = u.origin + u.pathname, keep = !u.pathname.endsWith('version.json');
    e.respondWith(fetch(req).then(r => { if (r.ok && keep) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(key, cp)); } return r; })
      .catch(() => caches.match(key).then(m => m || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
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
    ...(/iPhone|iPad|iPod|Macintosh/.test(self.navigator.userAgent) ? {} : { vibrate: [200, 100, 200], tag: 'lb-' + Date.now(), renotify: true, ...(d.actions ? { actions: d.actions } : {}) })
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const u = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope);
  // Botones de la notificación (Android): «Sí, hay» / «No hay» transmisión
  if (e.action === 'tr-si' || e.action === 'tr-no') u.searchParams.set('a', e.action.slice(3));
  const url = u.href, withQuery = !!u.search;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) {
      if (c.url.startsWith(self.registration.scope)) {
        if (withQuery && c.navigate) return c.navigate(url).then(x => x && x.focus()).catch(() => self.clients.openWindow(url));
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
