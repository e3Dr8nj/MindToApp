// Простая обёртка над IndexedDB для хранения папок модулей
const DB_NAME = 'NexusAlDB';
const DB_VERSION = 1;
const STORE_NAME = 'folderModules';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Сохранить папку модуля в IndexedDB
// files — массив объектов { path: 'images/pic.png', blob: Blob }
async function saveFolderModule(id, manifest, files, mainHtml) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const data = {
      id: id,
      manifest: manifest,
      files: files, // [{path, blob}]
      mainHtml: mainHtml,
      savedAt: Date.now()
    };
    
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

// Получить папку модуля из IndexedDB
async function getFolderModule(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Удалить папку модуля
async function deleteFolderModule(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

// Получить все папки модулей
async function getAllFolderModules() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Создать виртуальную файловую систему из файлов папки
// Возвращает { url: string (Blob URL на главный HTML), cleanup: function }
function createVirtualFS(folderData) {
  // Создаём Blob URL для каждого файла
  const blobUrls = {};
  for (const file of folderData.files) {
    blobUrls[file.path] = URL.createObjectURL(file.blob);
  }
  
  // Берём главный HTML и переписываем относительные пути на Blob URL
  let html = folderData.mainHtml;
  
  // Сортируем пути по длине (длинные сначала), чтобы не было конфликтов
  // Например, "images/logo.png" не должно замениться в "images/logo.png.bak"
  const sortedPaths = Object.keys(blobUrls).sort((a, b) => b.length - a.length);
  
  for (const path of sortedPaths) {
    const blobUrl = blobUrls[path];
    // Заменяем пути в атрибутах src, href, url()
    // Учитываем как абсолютные пути "./path", так и относительные "path"
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Паттерн для замены в src="..." href="..." url("...") url('...') url(...)
    const patterns = [
      new RegExp(`(src=["'])\\./?${escapedPath}(["'])`, 'g'),
      new RegExp(`(href=["'])\\./?${escapedPath}(["'])`, 'g'),
      new RegExp(`(url\\(["']?)\\./?${escapedPath}(["']?\\))`, 'g'),
      new RegExp(`(src=["'])${escapedPath}(["'])`, 'g'),
      new RegExp(`(href=["'])${escapedPath}(["'])`, 'g'),
      new RegExp(`(url\\(["']?)${escapedPath}(["']?\\))`, 'g')
    ];
    
    for (const pattern of patterns) {
      html = html.replace(pattern, `$1${blobUrl}$2`);
    }
  }
  
  // Создаём финальный Blob URL для HTML
  const finalBlob = new Blob([html], { type: 'text/html' });
  const finalUrl = URL.createObjectURL(finalBlob);
  
  return {
    url: finalUrl,
    cleanup: () => {
      URL.revokeObjectURL(finalUrl);
      for (const path in blobUrls) {
        URL.revokeObjectURL(blobUrls[path]);
      }
    }
  };
}