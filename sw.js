/* AXELAB service worker: network-first, so updates always win; cache is the offline fallback. */
const CACHE = 'axelab-v2';
const CORE = [
  './', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'css/app.css',
  'js/theory.js', 'js/guitar.js', 'js/audio.js', 'js/band.js', 'js/fretboard.js', 'js/tab.js', 'js/ui.js', 'js/diagram.js', 'js/app.js',
  'js/content/lessons.js', 'js/content/techniques.js', 'js/content/artists.js', 'js/content/routines.js',
  'js/panels/jam.js', 'js/panels/neck.js', 'js/panels/learn.js', 'js/panels/theory.js', 'js/panels/ear.js', 'js/panels/tools.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) { return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined); });
  }));
});
