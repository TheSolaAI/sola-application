/* Service Worker for Sola AI — versioned cache management & offline fallback */
const CACHE_PREFIX = 'sola-ai-';
const swUrl = new URL(self.location.href);
const versionParam = (swUrl.searchParams.get('v') || '0.0.1').trim();
const CACHE_NAME = versionParam.startsWith(CACHE_PREFIX)
  ? versionParam
  : `${CACHE_PREFIX}${versionParam.startsWith('v') ? versionParam : `v${versionParam}`}`;

const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/pwa-180x180.png',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/sola_black_logo.svg',
];

async function createOfflineFallbackResponse() {
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) return offlinePage;

  return new Response('You are offline and the requested resource is not cached.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' }),
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  const acceptHeader = request.headers.get('accept') || '';
  const isRscRequest =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('Next-Router-State-Tree') !== null ||
    url.searchParams.has('_rsc') ||
    acceptHeader.includes('text/x-component');

  if (isRscRequest) {
    return;
  }

  const isNavigation =
    request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedHtml = await caches.match(request);
          if (cachedHtml) return cachedHtml;
          return createOfflineFallbackResponse();
        })
    );
    return;
  }

  const isStaticHashedAsset = url.pathname.startsWith('/_next/static/');

  if (isStaticHashedAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => createOfflineFallbackResponse());
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (cachedResponse) return cachedResponse;
          return createOfflineFallbackResponse();
        });

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX))
            .map((name) => caches.delete(name))
        )
      )
    );
  }
});
