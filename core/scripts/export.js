// ==========================================
// ЭКСПОРТ ПРИЛОЖЕНИЙ В ПАПКУ
// ==========================================

const EXPORT_DB_NAME = 'MindToAppExportDB';
const EXPORT_STORE_NAME = 'folders';
const EXPORT_HANDLE_KEY = 'selectedExportFolder';

let exportFolderHandle = null;

// ==========================================
// IndexedDB для сохранения handle папки
// ==========================================

function openExportDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(EXPORT_DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(EXPORT_STORE_NAME)) {
        db.createObjectStore(EXPORT_STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveExportFolderHandle(handle) {
  try {
    const db = await openExportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXPORT_STORE_NAME, 'readwrite');
      tx.objectStore(EXPORT_STORE_NAME).put(handle, EXPORT_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to save export folder handle:', e);
  }
}

async function loadExportFolderHandle() {
  try {
    const db = await openExportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXPORT_STORE_NAME, 'readonly');
      const request = tx.objectStore(EXPORT_STORE_NAME).get(EXPORT_HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to load export folder handle:', e);
    return null;
  }
}

async function clearExportFolderHandle() {
  try {
    const db = await openExportDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXPORT_STORE_NAME, 'readwrite');
      tx.objectStore(EXPORT_STORE_NAME).delete(EXPORT_HANDLE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error('Failed to clear export folder handle:', e);
  }
}

// ==========================================
// ПРОВЕРКА РАЗРЕШЕНИЙ
// ==========================================

async function verifyExportPermission(handle, readWrite = false) {
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
// ОСНОВНАЯ ФУНКЦИЯ ЭКСПОРТА
// ==========================================

async function runExport() {
  const statusEl = document.getElementById('export-status');
  const logEl = document.getElementById('export-log');
  const exportBtn = document.getElementById('export-run-btn');

  if (!exportFolderHandle) {
    if (statusEl) { statusEl.textContent = t('importSelectFolderFirst'); statusEl.className = 'modal-status error'; }
    return;
  }

  const hasPermission = await verifyExportPermission(exportFolderHandle, true);
  if (!hasPermission) {
    if (statusEl) { statusEl.textContent = t('importPermissionDenied'); statusEl.className = 'modal-status error'; }
    return;
  }

  // Получаем только установленные приложения, у которых есть локальный контент
  const appsToExport = installedModules
    .map(id => allModules.find(m => m.id === id))
    .filter(m => m && m.content);

  if (appsToExport.length === 0) {
    if (statusEl) { statusEl.textContent = t('exportNoApps'); statusEl.className = 'modal-status error'; }
    return;
  }

  if (exportBtn) { exportBtn.disabled = true; exportBtn.textContent = '⏳ ' + t('exportRunning'); }
  if (logEl) { logEl.innerHTML = ''; logEl.style.display = 'block'; }
  if (statusEl) { statusEl.textContent = t('exportRunning'); statusEl.className = 'modal-status loading'; }

  let successCount = 0;
  let skipCount = 0;    // <-- НОВОЕ: счетчик пропущенных
  let errorCount = 0;

  try {
    for (const app of appsToExport) {
      // Формируем безопасное имя файла: Name_ID.html
      const safeName = app.name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s_-]/g, '').trim().replace(/\s+/g, '_').substring(0, 50);
      const filename = `${safeName}_${app.id}.html`;

      try {
        // 1. Пытаемся получить файл БЕЗ создания нового
        await exportFolderHandle.getFileHandle(filename, { create: false });
        
        // 2. Если ошибки не было, значит файл уже существует -> пропускаем
        skipCount++;
        appendExportLog(logEl, `⏭️ Пропущено (уже существует): ${filename}`, 'warning');
        
      } catch (e) {
        if (e.name === 'NotFoundError') {
          // 3. Файл не найден, значит можно безопасно создавать и записывать
          const fileHandle = await exportFolderHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(app.content);
          await writable.close();

          successCount++;
          appendExportLog(logEl, `✅ ${t('exportFileSaved')}: ${filename}`, 'success');
        } else {
          // 4. Другая ошибка (например, нет прав доступа)
          errorCount++;
          appendExportLog(logEl, `❌ ${t('exportFileError')}: ${filename} - ${e.message}`, 'error');
        }
      }
    }

    // Формируем итоговое сообщение
    let summaryText = `✅ Успешно: ${successCount}`;
    if (skipCount > 0) summaryText += ` | ⏭️ Пропущено: ${skipCount}`;
    if (errorCount > 0) summaryText += ` | ❌ Ошибок: ${errorCount}`;

    if (statusEl) {
      statusEl.textContent = summaryText;
      statusEl.className = successCount > 0 || skipCount > 0 ? 'modal-status success' : 'modal-status error';
    }

    if (successCount > 0 || skipCount > 0) {
      showToast(summaryText, 'success', 4000);
    }

  } catch (e) {
    console.error('Export error:', e);
    if (statusEl) { statusEl.textContent = t('exportFailed', { error: e.message }); statusEl.className = 'modal-status error'; }
  } finally {
    if (exportBtn) { exportBtn.disabled = false; exportBtn.textContent = t('exportRunBtn'); }
  }
}

function appendExportLog(logEl, text, type = 'info') {
  if (!logEl) return;
  const line = document.createElement('div');
  line.className = `export-log-line export-log-${type}`;
  line.textContent = text;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// ==========================================
// ВЫБОР ПАПКИ
// ==========================================

async function selectExportFolder() {
  const pathDisplay = document.getElementById('export-folder-path');
  const statusEl = document.getElementById('export-status');

  if (window.showDirectoryPicker) {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      exportFolderHandle = handle;
      await saveExportFolderHandle(handle);
      if (pathDisplay) pathDisplay.textContent = `📁 ${handle.name}`;
      if (statusEl) { statusEl.textContent = t('exportFolderSelected'); statusEl.className = 'modal-status success'; }
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('Directory picker error:', e);
    }
  }

  // Fallback
  if (statusEl) { 
    statusEl.textContent = '❌ File System Access API not supported. Please use Chrome or Edge.'; 
    statusEl.className = 'modal-status error'; 
  }
}

// ==========================================
// ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ
// ==========================================

async function openExportModal() {
  const modal = document.getElementById('export-modal');
  const pathDisplay = document.getElementById('export-folder-path');
  const statusEl = document.getElementById('export-status');
  const logEl = document.getElementById('export-log');

  if (!modal) return;

  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'modal-status'; }
  if (logEl) { logEl.innerHTML = ''; logEl.style.display = 'none'; }

  if (!exportFolderHandle) {
    const savedHandle = await loadExportFolderHandle();
    if (savedHandle) {
      const hasPermission = await verifyExportPermission(savedHandle, true);
      if (hasPermission) {
        exportFolderHandle = savedHandle;
        if (pathDisplay) pathDisplay.textContent = `📁 ${savedHandle.name}`;
      } else {
        exportFolderHandle = null;
        await clearExportFolderHandle();
        if (pathDisplay) pathDisplay.textContent = t('exportNoFolderSelected');
      }
    } else {
      if (pathDisplay) pathDisplay.textContent = t('exportNoFolderSelected');
    }
  } else {
    if (pathDisplay) pathDisplay.textContent = `📁 ${exportFolderHandle.name}`;
  }

  modal.classList.add('active');
}

function closeExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) modal.classList.remove('active');
}

function clearExportFolder() {
  exportFolderHandle = null;
  clearExportFolderHandle();
  const pathDisplay = document.getElementById('export-folder-path');
  const statusEl = document.getElementById('export-status');
  if (pathDisplay) pathDisplay.textContent = t('exportNoFolderSelected');
  if (statusEl) { statusEl.textContent = t('exportFolderCleared'); statusEl.className = 'modal-status'; }
}