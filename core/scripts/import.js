// ==========================================
// ИМПОРТ ПРИЛОЖЕНИЙ ИЗ ПАПКИ
// Рекурсивное сканирование папки и создание
// приложений из HTML-файлов
// ==========================================

const IMPORT_DB_NAME = 'MindToAppImportDB';
const IMPORT_STORE_NAME = 'folders';
const IMPORT_HANDLE_KEY = 'selectedFolder';

let importFolderHandle = null;

// ==========================================
// IndexedDB для сохранения handle папки
// ==========================================

function openImportDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMPORT_DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IMPORT_STORE_NAME)) {
        db.createObjectStore(IMPORT_STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveFolderHandle(handle) {
  try {
    const db = await openImportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMPORT_STORE_NAME, 'readwrite');
      tx.objectStore(IMPORT_STORE_NAME).put(handle, IMPORT_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to save folder handle:', e);
  }
}

async function loadFolderHandle() {
  try {
    const db = await openImportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMPORT_STORE_NAME, 'readonly');
      const request = tx.objectStore(IMPORT_STORE_NAME).get(IMPORT_HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to load folder handle:', e);
    return null;
  }
}

async function clearFolderHandle() {
  try {
    const db = await openImportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMPORT_STORE_NAME, 'readwrite');
      tx.objectStore(IMPORT_STORE_NAME).delete(IMPORT_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to clear folder handle:', e);
  }
}

// ==========================================
// ПРОВЕРКА РАЗРЕШЕНИЙ
// ==========================================

async function verifyPermission(handle, readWrite = false) {
  const options = readWrite ? { mode: 'readwrite' } : { mode: 'read' };
  if (await handle.queryPermission(options) === 'granted') {
    return true;
  }
  if (await handle.requestPermission(options) === 'granted') {
    return true;
  }
  return false;
}

// ==========================================
// РЕКУРСИВНЫЙ ОБХОД ПАПКИ
// ==========================================

async function* walkDirectory(dirHandle, path = '') {
  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      yield { handle: entry, path: entryPath, name: entry.name };
    } else if (entry.kind === 'directory') {
      yield* walkDirectory(entry, entryPath);
    }
  }
}

// ==========================================
// ЧТЕНИЕ HTML-ФАЙЛА И ПАРСИНГ MANIFEST
// ==========================================

async function readHtmlFile(fileHandle) {
  const file = await fileHandle.getFile();
  return await file.text();
}

function parseManifestFromHtml(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) return null;

    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) return null;
    return manifest;
  } catch (e) {
    console.error('Failed to parse manifest:', e);
    return null;
  }
}

// ==========================================
// СОЗДАНИЕ ПРИЛОЖЕНИЯ ИЗ ФАЙЛА
// ==========================================

function createAppFromHtml(html, manifest) {
  const newModule = {
    id: manifest.id,
    name: manifest.name,
    icon: manifest.icon,
    description: manifest.description || 'Imported from file',
    content: html,
    isCustom: true,
    isLocal: true,
    isFolder: false
  };

  customModules.push(newModule);
  localStorage.setItem('customModules', JSON.stringify(customModules));

  if (!installedModules.includes(manifest.id)) {
    installedModules.push(manifest.id);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }

  allModules.push({
    ...manifest,
    content: html,
    url: URL.createObjectURL(new Blob([html], { type: 'text/html' })),
    isCustom: true,
    isLocal: true,
    isFolder: false
  });
}

// ==========================================
// ОСНОВНАЯ ФУНКЦИЯ ИМПОРТА
// ==========================================

async function runImport() {
  const statusEl = document.getElementById('import-status');
  const logEl = document.getElementById('import-log');
  const importBtn = document.getElementById('import-run-btn');

  if (!importFolderHandle) {
    if (statusEl) { statusEl.textContent = t('importSelectFolderFirst'); statusEl.className = 'modal-status error'; }
    return;
  }

  const hasPermission = await verifyPermission(importFolderHandle, false);
  if (!hasPermission) {
    if (statusEl) { statusEl.textContent = t('importPermissionDenied'); statusEl.className = 'modal-status error'; }
    return;
  }

  if (importBtn) { importBtn.disabled = true; importBtn.textContent = '⏳ ' + t('importRunning'); }
  if (logEl) { logEl.innerHTML = ''; logEl.style.display = 'block'; }
  if (statusEl) { statusEl.textContent = t('importScanning'); statusEl.className = 'modal-status loading'; }

  let found = 0;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  try {
    for await (const entry of walkDirectory(importFolderHandle)) {
      if (!entry.name.toLowerCase().endsWith('.html') && !entry.name.toLowerCase().endsWith('.htm')) {
        continue;
      }

      found++;
      appendImportLog(logEl, `📄 ${entry.path}`, 'info');

      try {
        const html = await readHtmlFile(entry.handle);
        const manifest = parseManifestFromHtml(html);

        if (!manifest) {
          appendImportLog(logEl, `  ⚠️ ${t('importNoManifest')}`, 'warning');
          errors++;
          continue;
        }

        if (allModules.some(m => m.id === manifest.id)) {
          appendImportLog(logEl, `  ⏭️ ${t('importAlreadyExists')}: ${manifest.name}`, 'warning');
          skipped++;
          continue;
        }

        createAppFromHtml(html, manifest);
        appendImportLog(logEl, `  ✅ ${t('importCreated')}: ${manifest.icon} ${manifest.name}`, 'success');
        imported++;
      } catch (e) {
        appendImportLog(logEl, `  ❌ ${t('importError')}: ${e.message}`, 'error');
        errors++;
      }
    }

    const summary = t('importSummary', {
      found: found,
      imported: imported,
      skipped: skipped,
      errors: errors
    });

    if (statusEl) {
      statusEl.textContent = summary;
      statusEl.className = imported > 0 ? 'modal-status success' : 'modal-status';
    }

    if (imported > 0) {
      renderInstalledApps();
      renderAllApps();
      showToast(t('importSuccess', { count: imported }), 'success', 4000);
    } else if (found === 0) {
      showToast(t('importNoFiles'), 'error', 3000);
    }

  } catch (e) {
    console.error('Import error:', e);
    if (statusEl) { statusEl.textContent = `❌ ${e.message}`; statusEl.className = 'modal-status error'; }
  } finally {
    if (importBtn) { importBtn.disabled = false; importBtn.textContent = t('importRunBtn'); }
  }
}

function appendImportLog(logEl, text, type = 'info') {
  if (!logEl) return;
  const line = document.createElement('div');
  line.className = `import-log-line import-log-${type}`;
  line.textContent = text;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// ==========================================
// ВЫБОР ПАПКИ
// ==========================================

async function selectImportFolder() {
  const pathDisplay = document.getElementById('import-folder-path');
  const statusEl = document.getElementById('import-status');

  // File System Access API (Chrome, Edge)
  if (window.showDirectoryPicker) {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'read' });
      importFolderHandle = handle;
      await saveFolderHandle(handle);
      if (pathDisplay) pathDisplay.textContent = `📁 ${handle.name}`;
      if (statusEl) { statusEl.textContent = t('importFolderSelected'); statusEl.className = 'modal-status success'; }
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('Directory picker error:', e);
    }
  }

  // Fallback: input type="file" webkitdirectory
  const fileInput = document.getElementById('import-folder-input');
  if (fileInput) {
    fileInput.click();
  }
}

async function handleFallbackFolderSelect(event) {
  const files = event.target.files;
  const pathDisplay = document.getElementById('import-folder-path');
  const statusEl = document.getElementById('import-status');

  if (!files || files.length === 0) {
    importFolderHandle = null;
    if (pathDisplay) pathDisplay.textContent = t('importNoFolderSelected');
    return;
  }

  // Создаём виртуальный handle из файлов
  importFolderHandle = createVirtualFolderHandle(files);
  if (pathDisplay) {
    const firstName = files[0].webkitRelativePath.split('/')[0];
    pathDisplay.textContent = `📁 ${firstName}`;
  }
  if (statusEl) { statusEl.textContent = t('importFolderSelected'); statusEl.className = 'modal-status success'; }

  event.target.value = '';
}

// Виртуальный handle для fallback (когда File System Access API недоступен)
function createVirtualFolderHandle(files) {
  const tree = {};

  for (const file of files) {
    const parts = file.webkitRelativePath.split('/');
    let current = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    current[parts[parts.length - 1]] = file;
  }

  const rootName = files[0].webkitRelativePath.split('/')[0];

  function buildHandle(name, node) {
    if (node instanceof File) {
      return {
        kind: 'file',
        name: name,
        getFile: async () => node
      };
    }

    const entries = Object.entries(node).map(([childName, child]) => [childName, buildHandle(childName, child)]);

    return {
      kind: 'directory',
      name: name,
      values: async function* () {
        for (const [entryName, entryHandle] of entries) {
          yield entryHandle;
        }
      }
    };
  }

  return buildHandle(rootName, tree[rootName] || tree);
}

// ==========================================
// ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ
// ==========================================

async function openImportModal() {
  const modal = document.getElementById('import-modal');
  const pathDisplay = document.getElementById('import-folder-path');
  const statusEl = document.getElementById('import-status');
  const logEl = document.getElementById('import-log');

  if (!modal) return;

  // Очищаем предыдущий статус и лог
  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'modal-status'; }
  if (logEl) { logEl.innerHTML = ''; logEl.style.display = 'none'; }

  // Пытаемся восстановить сохранённую папку
  if (!importFolderHandle) {
    const savedHandle = await loadFolderHandle();
    if (savedHandle) {
      const hasPermission = await verifyPermission(savedHandle, false);
      if (hasPermission) {
        importFolderHandle = savedHandle;
        if (pathDisplay) pathDisplay.textContent = `📁 ${savedHandle.name}`;
      } else {
        importFolderHandle = null;
        await clearFolderHandle();
        if (pathDisplay) pathDisplay.textContent = t('importNoFolderSelected');
      }
    } else {
      if (pathDisplay) pathDisplay.textContent = t('importNoFolderSelected');
    }
  } else {
    if (pathDisplay) pathDisplay.textContent = `📁 ${importFolderHandle.name}`;
  }

  modal.classList.add('active');
}

function closeImportModal() {
  const modal = document.getElementById('import-modal');
  if (modal) modal.classList.remove('active');
}

function clearImportFolder() {
  importFolderHandle = null;
  clearFolderHandle();
  const pathDisplay = document.getElementById('import-folder-path');
  const statusEl = document.getElementById('import-status');
  if (pathDisplay) pathDisplay.textContent = t('importNoFolderSelected');
  if (statusEl) { statusEl.textContent = t('importFolderCleared'); statusEl.className = 'modal-status'; }
}