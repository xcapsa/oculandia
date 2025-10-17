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

const VERSION = 'v1.0.0';
const STATIC_CACHE = `oculandia-static-${VERSION}`;
const RUNTIME_CACHE = 'oculandia-runtime';
const OFFLINE_URL = '/offline.html';

// Files to precache during install.  These are the core pages and assets
// required for the app to load even when offline.  If you add new pages
// or move files, update this list accordingly.
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/events.html',
  '/deals.html',
  '/profile.html',
  '/main.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

// Install event: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate event: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler: route requests based on type
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; ignore others (e.g., POST for forms)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // For page navigations: try network first with timeout, then cache, then offline page
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // For same‑origin static assets: serve from cache first, then network
  const staticExtensions = ['.html', '.js', '.css', '.png', '.svg', '.webp', '.jpg', '.jpeg', '.ico', '.json'];
  const isStaticAsset = isSameOrigin && staticExtensions.some((ext) => url.pathname.endsWith(ext));
  if (isStaticAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // For images and other runtime resources (including cross‑origin): use stale‑while‑revalidate
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    !isSameOrigin
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: just fetch from network; fallback to cache on failure
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle navigation: network first, fallback to cache or offline page
async function handleNavigation(request) {
  try {
    const response = await networkFirst(request, 3000);
    return response;
  } catch (err) {
    // try cached version of this page
    const cached = await caches.match(request);
    if (cached) return cached;
    // fallback to offline page
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// Cache‑first strategy for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

// Stale‑while‑revalidate strategy for runtime assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// Network first with timeout
async function networkFirst(request, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(id);
    if (response && response.ok) return response;
    throw new Error('Network response not ok');
  } catch (err) {
    clearTimeout(id);
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}