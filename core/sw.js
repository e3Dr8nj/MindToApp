const CACHE_NAME = 'mind-to-app-v1';

const urlsToCache = [
  '/MindToApp/core/',
  '/MindToApp/core/index.html',
  '/MindToApp/core/styles.css',
  '/MindToApp/core/app.js',
  '/MindToApp/core/db.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('nexus-ai-') || name.startsWith('mind-to-app-'))
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Удаляю старый кэш:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Открыт новый кэш:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/modules/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});