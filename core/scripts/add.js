// ==========================================
// ДОБАВЛЕНИЕ МОДУЛЯ (URL / ФАЙЛ / ПАПКА / КОД)
// ==========================================

let selectedLocalFile = null;
let selectedFolderFiles = null;
let currentAddTab = 'url';

function openAddModal() {
  const modal = document.getElementById('add-modal');
  const urlInput = document.getElementById('module-url-input');
  const codeInput = document.getElementById('code-input-textarea');
  const status = document.getElementById('modal-status');
  const fileNameDisplay = document.getElementById('selected-file-name');
  const folderInfoDisplay = document.getElementById('selected-folder-info');

  if (urlInput) urlInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status) { status.textContent = ''; status.className = 'modal-status'; }
  if (fileNameDisplay) fileNameDisplay.textContent = '';
  if (folderInfoDisplay) folderInfoDisplay.textContent = '';

  selectedLocalFile = null;
  selectedFolderFiles = null;
  currentAddTab = 'url';

  // Активируем вкладку URL по умолчанию
  document.querySelectorAll('#add-modal .tab').forEach(tab => {
    tab.style.display = tab.dataset.tab === 'url' ? 'block' : 'none';
  });
  document.querySelectorAll('#add-modal .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === 'url');
  });

  if (modal) modal.classList.add('active');
}

function closeAddModal() {
  const modal = document.getElementById('add-modal');
  if (modal) modal.classList.remove('active');
}

function switchTab(targetTab) {
  currentAddTab = targetTab;
  document.querySelectorAll('#add-modal .tab').forEach(tab => {
    tab.style.display = tab.dataset.tab === targetTab ? 'block' : 'none';
  });
  document.querySelectorAll('#add-modal .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetTab);
  });

  const status = document.getElementById('modal-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }
}

// ==========================================
// ОБРАБОТКА ЛОКАЛЬНОГО ФАЙЛА
// ==========================================

function handleLocalFileSelect(event) {
  const file = event.target.files[0];
  const fileNameDisplay = document.getElementById('selected-file-name');

  if (!file) {
    selectedLocalFile = null;
    if (fileNameDisplay) fileNameDisplay.textContent = '';
    return;
  }

  if (!file.name.toLowerCase().endsWith('.html')) {
    const status = document.getElementById('modal-status');
    if (status) { status.textContent = '❌ Please select an .html file'; status.className = 'modal-status error'; }
    selectedLocalFile = null;
    event.target.value = '';
    return;
  }

  selectedLocalFile = file;
  if (fileNameDisplay) fileNameDisplay.textContent = `✅ ${file.name}`;
}

// ==========================================
// ОБРАБОТКА ВЫБОРА ПАПКИ
// ==========================================

function handleFolderSelect(event) {
  const files = Array.from(event.target.files);
  const folderInfoDisplay = document.getElementById('selected-folder-info');

  if (files.length === 0) {
    selectedFolderFiles = null;
    if (folderInfoDisplay) folderInfoDisplay.textContent = '';
    return;
  }

  const hasIndex = files.some(f => f.name.toLowerCase() === 'index.html');
  if (!hasIndex) {
    const status = document.getElementById('modal-status');
    if (status) { status.textContent = '❌ Folder must contain index.html'; status.className = 'modal-status error'; }
    selectedFolderFiles = null;
    event.target.value = '';
    return;
  }

  selectedFolderFiles = files;
  const folderName = files[0].webkitRelativePath.split('/')[0];
  if (folderInfoDisplay) folderInfoDisplay.textContent = `✅ ${folderName} (${files.length} files)`;
}

// ==========================================
// ГЛАВНАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ МОДУЛЯ
// ==========================================

async function addModule() {
  const status = document.getElementById('modal-status');

  if (currentAddTab === 'url') {
    await addFromUrl();
  } else if (currentAddTab === 'local') {
    await addFromLocalFile();
  } else if (currentAddTab === 'folder') {
    await addFromFolder();
  } else if (currentAddTab === 'code') {
    addFromCode();
  }
}

// ==========================================
// ДОБАВЛЕНИЕ ИЗ URL
// ==========================================

async function addFromUrl() {
  const urlInput = document.getElementById('module-url-input');
  const status = document.getElementById('modal-status');

  if (!urlInput) return;
  const url = urlInput.value.trim();

  if (!url) {
    if (status) { status.textContent = t('enterUrl'); status.className = 'modal-status error'; }
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (status) { status.textContent = t('invalidUrl'); status.className = 'modal-status error'; }
    return;
  }

  if (status) { status.textContent = t('loadingByUrl'); status.className = 'modal-status loading'; }

  try {
    let html;

    // Определяем тип URL
    if (url.includes('gist.github.com') || url.includes('gist.githubusercontent.com')) {
      // GitHub Gist
      const rawUrl = convertGistToRaw(url);
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      html = await response.text();
    } else {
      // Обычный URL
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      html = await response.text();
    }

    // Проверяем, что это HTML
    if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<HTML')) {
      throw new Error(t('noHtmlAtUrl'));
    }

    // Используем универсальную функцию создания приложения
    const result = createAppFromHtml(html, { defaultDescription: 'Added from URL' });

    if (result.success) {
      if (status) { status.textContent = t('appCreated', { name: result.manifest.name }); status.className = 'modal-status success'; }
      setTimeout(() => {
        closeAddModal();
        showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
      }, 1000);
    } else {
      if (status) { status.textContent = getCreateAppErrorMessage(result.error); status.className = 'modal-status error'; }
    }

  } catch (error) {
    console.error('URL add error:', error);
    if (status) { status.textContent = t('loadFailed', { message: error.message }); status.className = 'modal-status error'; }
  }
}

// ==========================================
// ДОБАВЛЕНИЕ ИЗ ЛОКАЛЬНОГО ФАЙЛА
// ==========================================

async function addFromLocalFile() {
  const status = document.getElementById('modal-status');

  if (!selectedLocalFile) {
    if (status) { status.textContent = '❌ Please select a file first'; status.className = 'modal-status error'; }
    return;
  }

  try {
    const html = await selectedLocalFile.text();

    // Используем универсальную функцию создания приложения
    const result = createAppFromHtml(html, { defaultDescription: 'Added from local file' });

    if (result.success) {
      if (status) { status.textContent = t('appCreated', { name: result.manifest.name }); status.className = 'modal-status success'; }
      setTimeout(() => {
        closeAddModal();
        showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
      }, 1000);
    } else {
      if (status) { status.textContent = getCreateAppErrorMessage(result.error); status.className = 'modal-status error'; }
    }

  } catch (error) {
    console.error('Local file add error:', error);
    if (status) { status.textContent = `❌ ${error.message}`; status.className = 'modal-status error'; }
  }
}

// ==========================================
// ДОБАВЛЕНИЕ ИЗ ПАПКИ
// ==========================================

async function addFromFolder() {
  const status = document.getElementById('modal-status');

  if (!selectedFolderFiles || selectedFolderFiles.length === 0) {
    if (status) { status.textContent = '❌ Please select a folder first'; status.className = 'modal-status error'; }
    return;
  }

  try {
    // Находим index.html
    const indexFile = selectedFolderFiles.find(f => f.name.toLowerCase() === 'index.html');
    if (!indexFile) {
      if (status) { status.textContent = '❌ Folder must contain index.html'; status.className = 'modal-status error'; }
      return;
    }

    const html = await indexFile.text();

    // Используем универсальную функцию создания приложения
    const result = createAppFromHtml(html, { defaultDescription: 'Added from folder' });

    if (result.success) {
      if (status) { status.textContent = t('appCreated', { name: result.manifest.name }); status.className = 'modal-status success'; }
      setTimeout(() => {
        closeAddModal();
        showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
      }, 1000);
    } else {
      if (status) { status.textContent = getCreateAppErrorMessage(result.error); status.className = 'modal-status error'; }
    }

  } catch (error) {
    console.error('Folder add error:', error);
    if (status) { status.textContent = `❌ ${error.message}`; status.className = 'modal-status error'; }
  }
}

// ==========================================
// ДОБАВЛЕНИЕ ИЗ КОДА
// ==========================================

function addFromCode() {
  const codeInput = document.getElementById('code-input-textarea');
  const status = document.getElementById('modal-status');

  if (!codeInput) return;
  const code = codeInput.value.trim();

  if (!code) {
    if (status) { status.textContent = t('enterCode'); status.className = 'modal-status error'; }
    return;
  }

  if (status) { status.textContent = t('analyzing'); status.className = 'modal-status loading'; }

  // Используем универсальную функцию создания приложения
  const result = createAppFromHtml(code, { defaultDescription: 'Added from code' });

  if (result.success) {
    if (result.manifestGenerated) {
      if (status) { 
        status.textContent = `✅ ${t('appCreated', { name: result.manifest.name })} (manifest сгенерирован)`; 
        status.className = 'modal-status success'; 
      }
    } else {
      if (status) { status.textContent = t('appCreated', { name: result.manifest.name }); status.className = 'modal-status success'; }
    }
    setTimeout(() => {
      closeAddModal();
      showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
    }, 1000);
  } else {
    if (status) { status.textContent = getCreateAppErrorMessage(result.error); status.className = 'modal-status error'; }
  }
}

// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ФАЙЛОВ
// ==========================================

function setupAddModuleListeners() {
  const localFileInput = document.getElementById('local-file-input');
  const folderInput = document.getElementById('folder-input');

  if (localFileInput) {
    localFileInput.addEventListener('change', handleLocalFileSelect);
  }

  if (folderInput) {
    folderInput.addEventListener('change', handleFolderSelect);
  }
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAddModuleListeners);
} else {
  setupAddModuleListeners();
}