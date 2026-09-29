const CACHE_NAME = 'nexus-ai-v1';
const urlsToCache = [
  '/NexusAl/core/',
  '/NexusAl/core/index.html',
  '/NexusAl/core/styles.css',
  '/NexusAl/core/app.js'
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов и отдача из кэша
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});