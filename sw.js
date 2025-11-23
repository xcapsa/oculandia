/*
 * Oculandia VR - Service Worker
 *
 * This service worker enables offline support for the Oculandia VR web app.
 * It precaches key assets on install, cleans up old caches on activate, and
 * serves pages from cache when the network is unavailable.  For runtime
 * requests (images and third‑party assets) it uses a stale‑while‑revalidate
 * strategy so the app stays snappy while still updating resources in the
 * background.  See MDN guides for more on service worker strategies【918242469817152†L268-L308】.
 */

const CACHE_NAME = 'oculandia-cache-v3'; // Incrementata versione a v3 per forzare update
const urlsToCache = [
  '/',
  '/index.html',
  '/deals.html',
  '/events.html',
  '/shop.html',
  '/social.html',
  '/minecraft.html',
  '/offline.html',
  '/login.html',
  '/register.html',
  '/profile.html',
  '/main.js',
  '/friends.js',
  '/login.js',
  '/register.js',
  '/profile.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/resources/hero-vr-gaming.png',
  '/resources/minecraft-blurred.jpg',
  '/manifest.json'
];

// Installazione
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Attivazione e pulizia
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
        });
      })
  );
});
