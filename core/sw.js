const CACHE_NAME = 'mind-to-app-v11';

const urlsToCache = [
  '/MindToApp/core/index.html', // Убрали '/' в конце, оставили конкретный файл
  '/MindToApp/core/styles.css',
  '/MindToApp/core/sw.js',
  '/MindToApp/core/manifest.json',
  '/MindToApp/core/icon-512.png',
  '/MindToApp/core/scripts/db.js',
  '/MindToApp/core/scripts/state.js',
  '/MindToApp/core/scripts/registry.js',
  '/MindToApp/core/scripts/render.js',
  '/MindToApp/core/scripts/create.js',
  '/MindToApp/core/scripts/edit.js',
  '/MindToApp/core/scripts/add.js',
  '/MindToApp/core/scripts/share.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('nexus-ai-') || name.startsWith('mind-to-app-'))
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Кэширую файлы...');
        // Добавляем .catch(), чтобы установка не падала, если один файл недоступен
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('[SW] Не все файлы закэшированы, но установка продолжается:', err);
        });
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/modules/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse; // Сначала отдаем из кэша (работает офлайн!)
      
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      }).catch(() => {
        return caches.match('/MindToApp/core/index.html');
      });
    })
  );
});