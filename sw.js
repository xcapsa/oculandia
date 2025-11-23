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

const CACHE_NAME = 'oculandia-cache-v2'; // Ho cambiato v1 in v2 per forzare l'aggiornamento
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

// Installazione: scarica e salva i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Forza l'attivazione immediata del nuovo SW
});

// Attivazione: pulisce la vecchia cache (es. v1)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Prende il controllo immediato della pagina
});

// Fetch: serve i file dalla cache, se non ci sono prova online
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          function(response) {
            // Se la risposta non è valida, ritorna
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta per metterla in cache per la prossima volta
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Non cachiamo richieste esterne (come le immagini Amazon) nel main cache
                if(event.request.url.startsWith('http')) {
                    // Opzionale: gestione cache dinamica per immagini esterne
                }
              });

            return response;
          }
        ).catch(() => {
            // Se siamo offline e la pagina non è in cache, mostra la pagina offline
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
        });
      })
  );
});
