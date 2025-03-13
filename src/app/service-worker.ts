/// <reference lib="webworker" />

export default null;

const worker = self as unknown as ServiceWorkerGlobalScope;

// Install event - cache static assets
worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('sola-ai-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icons/pwa-180x180.png',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/icons/maskable-icon-512x512.png',
        '/sola_black_logo.svg',
        '/offline.html', // Make sure to cache the offline page
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
          .filter((cacheName) => cacheName !== 'sola-ai-v1')
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

          return caches.open('sola-ai-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
      .catch(async () => {
        // Fallback for offline access - must return a Response object
        return caches.match('/offline.html').then((offlineResponse) => {
          // If offline page is in cache, return it
          if (offlineResponse) {
            return offlineResponse;
          }
          // Otherwise, create a simple response
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
