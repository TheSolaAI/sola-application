/// <reference lib="webworker" />
import { CACHE_PREFIX, getCacheVersion } from '@/utils/version';

const serviceWorkerExport = null;
export default serviceWorkerExport;

const worker = self as unknown as ServiceWorkerGlobalScope;
const swUrl =
  typeof self !== 'undefined' && self.location
    ? new URL(self.location.href)
    : null;
const queryVersion = swUrl?.searchParams.get('v') || undefined;
const CACHE_NAME = getCacheVersion(queryVersion);

// Pre-cached assets for offline resilience (do NOT cache root HTML document aggressively)
const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/pwa-180x180.png',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/sola_black_logo.svg',
];

async function createOfflineFallbackResponse(): Promise<Response> {
  const offlinePage = await caches.match('/offline.html');
  if (offlinePage) return offlinePage;

  return new Response('You are offline and the requested resource is not cached.', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' }),
  });
}

// Install event - pre-cache offline assets and activate immediately
worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => worker.skipWaiting())
  );
});

// Activate event - purge old versioned caches owned by this app and take control of all clients
worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
            )
            .map((cacheName) => {
              console.log(
                '[ServiceWorker] Removing stale cache version:',
                cacheName
              );
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => worker.clients.claim())
  );
});

// Fetch event - network-first for navigation/HTML, cache-first for immutable static assets
worker.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass cache completely for API routes, telemetry, or external non-http
  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass cache for Next.js App Router React Server Component (RSC) / flight / prefetch requests
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

  // 1. Navigation / HTML Document requests: Network-First to guarantee fresh application
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
          // If offline or network fails, fallback to cached HTML or offline page
          const cachedHtml = await caches.match(request);
          if (cachedHtml) return cachedHtml;

          return createOfflineFallbackResponse();
        })
    );
    return;
  }

  // 2. Next.js hashed static assets (_next/static): Cache-First since they are content-hashed
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

  // 3. Other public static assets: Stale-While-Revalidate with versioned cache
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

// Message listener for client cache invalidation and skip-waiting triggers
worker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    worker.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX))
            .map((name) => caches.delete(name))
        );
      })
    );
  }
});
