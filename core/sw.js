const CACHE_NAME = 'nexus-ai-v2'; // ⚠️ ВАЖНО: меняй v2 на v3, v4 и т.д. при каждом крупном обновлении

const urlsToCache = [
  '/NexusAl/core/',
  '/NexusAl/core/index.html',
  '/NexusAl/core/styles.css',
  '/NexusAl/core/app.js',
  '/NexusAl/core/db.js'
];

// Установка: кэшируем файлы и УДАЛЯЕМ старые кэши
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('nexus-ai-') && name !== CACHE_NAME)
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
  // Активируем новый SW сразу
  self.skipWaiting();
});

// Активация: берём контроль над всеми вкладками сразу
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Перехват запросов: СНАЧАЛА сеть, ПОТОМ кэш (стратегия "Network First")
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к модулям (они динамические)
  if (event.request.url.includes('/modules/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Если ответ получен — обновляем кэш свежей версией
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сеть недоступна — берём из кэша
        return caches.match(event.request);
      })
  );
});