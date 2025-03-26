/// <reference lib="webworker" />
import { getCacheVersion } from '@/utils/version';

const serviceWorkerExport = null;
export default serviceWorkerExport;

const worker = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = getCacheVersion();

// Install event - cache static assets
worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icons/pwa-180x180.png',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/icons/maskable-icon-512x512.png',
        '/sola_black_logo.svg',
        '/offline.html',
      ]);
    })
  );
});

// Activate event - clean up old caches
worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - serve from cache when possible
worker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache API responses or other dynamic content
          if (
            !response.url.startsWith('http') ||
            response.url.includes('/api/')
          ) {
            return response;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
      .catch(async () => {
        return caches.match('/offline.html').then((offlineResponse) => {
          if (offlineResponse) {
            return offlineResponse;
          }
          return new Response(
            'You are offline and the offline page is not cached.',
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            }
          );
        });
      })
  );
});
