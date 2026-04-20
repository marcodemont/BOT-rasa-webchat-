const CACHE_NAME = 'aurum-v0-06-shell-3-weekview';
const APP_SHELL = [
  './index.html',
  './AURUM.html',
  './ble-ring.js',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  const isShellAsset = APP_SHELL.some(path => url.pathname.endsWith(path.replace('./', '/')));
  if (!isShellAsset) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const cloned = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, cloned));
        return resp;
      });
    })
  );
});
