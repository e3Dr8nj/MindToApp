// ==========================================
// ДОБАВЛЕНИЕ МОДУЛЯ (URL / ФАЙЛ / ПАПКА / КОД)
// Изолированная область, чтобы не конфликтовать
// с другими файлами по let/const
// ==========================================

(function () {
  if (window.__MindToAppAddModuleInitialized) {
    console.warn('add.js already initialized, skipping duplicate load');
    return;
  }

  window.__MindToAppAddModuleInitialized = true;

  let selectedLocalFile = null;
  let selectedFolderFiles = null;
  let currentAddTab = 'url';

  // ==========================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================

  function setAddStatus(message, type = '') {
    const status = document.getElementById('modal-status');
    if (!status) return;

    status.textContent = message;
    status.className = `modal-status ${type}`.trim();
  }

  function clearAddStatus() {
    setAddStatus('', '');
  }

  function ensureFactoryLoaded() {
    if (typeof createAppFromHtml !== 'function') {
      setAddStatus('❌ app-factory.js не загружен', 'error');
      return false;
    }
    return true;
  }

  function showCreatedStatus(result, sourceText) {
    if (result.manifestGenerated) {
      setAddStatus(
        `✅ ${t('appCreated', { name: result.manifest.name })} (manifest сгенерирован)`,
        'success'
      );
    } else {
      setAddStatus(
        t('appCreated', { name: result.manifest.name }),
        'success'
      );
    }

    setTimeout(() => {
      closeAddModal();

      if (typeof showToast === 'function') {
        showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
      }
    }, 800);
  }

  function createByFactory(html, defaultDescription) {
    if (!ensureFactoryLoaded()) return null;

    const result = createAppFromHtml(html, {
      defaultDescription: defaultDescription || 'Added module'
    });

    if (result.success) {
      showCreatedStatus(result, defaultDescription);
      return result;
    }

    if (typeof getCreateAppErrorMessage === 'function') {
      setAddStatus(getCreateAppErrorMessage(result.error), 'error');
    } else {
      setAddStatus(`❌ ${result.error}`, 'error');
    }

    return result;
  }

  // ==========================================
  // ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ
  // ==========================================

  function openAddModal() {
    const modal = document.getElementById('add-modal');
    const urlInput = document.getElementById('module-url-input');
    const codeInput = document.getElementById('code-input-textarea');
    const fileNameDisplay = document.getElementById('selected-file-name');
    const folderInfoDisplay = document.getElementById('selected-folder-info');
    const localFileInput = document.getElementById('local-file-input');
    const folderInput = document.getElementById('folder-input');

    if (urlInput) urlInput.value = '';
    if (codeInput) codeInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = '';
    if (folderInfoDisplay) folderInfoDisplay.textContent = '';
    if (localFileInput) localFileInput.value = '';
    if (folderInput) folderInput.value = '';

    selectedLocalFile = null;
    selectedFolderFiles = null;

    clearAddStatus();
    switchTab('url');

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

    clearAddStatus();
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

    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setAddStatus('❌ Please select an .html file', 'error');
      selectedLocalFile = null;
      event.target.value = '';
      return;
    }

    selectedLocalFile = file;

    if (fileNameDisplay) {
      fileNameDisplay.textContent = `✅ ${file.name}`;
    }

    clearAddStatus();
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
      setAddStatus('❌ Folder must contain index.html', 'error');
      selectedFolderFiles = null;
      event.target.value = '';
      return;
    }

    selectedFolderFiles = files;

    const folderName = files[0].webkitRelativePath
      ? files[0].webkitRelativePath.split('/')[0]
      : 'Selected folder';

    if (folderInfoDisplay) {
      folderInfoDisplay.textContent = `✅ ${folderName} (${files.length} files)`;
    }

    clearAddStatus();
  }

  // ==========================================
  // ГЛАВНАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ МОДУЛЯ
  // ==========================================

  async function addModule() {
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

    if (!urlInput) return;

    const url = urlInput.value.trim();

    if (!url) {
      setAddStatus(t('enterUrl'), 'error');
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      setAddStatus(t('invalidUrl'), 'error');
      return;
    }

    setAddStatus(t('loadingByUrl'), 'loading');

    try {
      let finalUrl = url;

      if (
        typeof convertGistToRaw === 'function' &&
        (url.includes('gist.github.com') || url.includes('gist.githubusercontent.com'))
      ) {
        finalUrl = convertGistToRaw(url);
      }

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Проверяем наличие слова html, как ты просил.
      // Дальше всё создание идёт только через app-factory.js.
      if (!/html/i.test(html)) {
        setAddStatus(t('noHtmlAtUrl'), 'error');
        return;
      }

      createByFactory(html, 'Added from URL');

    } catch (error) {
      console.error('URL add error:', error);
      setAddStatus(t('loadFailed', { message: error.message }), 'error');
    }
  }

  // ==========================================
  // ДОБАВЛЕНИЕ ИЗ ЛОКАЛЬНОГО ФАЙЛА
  // ==========================================

  async function addFromLocalFile() {
    if (!selectedLocalFile) {
      setAddStatus('❌ Please select a file first', 'error');
      return;
    }

    try {
      setAddStatus(t('analyzing'), 'loading');

      const html = await selectedLocalFile.text();

      if (!/html/i.test(html)) {
        setAddStatus(t('notHtml'), 'error');
        return;
      }

      createByFactory(html, 'Added from local file');

    } catch (error) {
      console.error('Local file add error:', error);
      setAddStatus(`❌ ${error.message}`, 'error');
    }
  }

  // ==========================================
  // ДОБАВЛЕНИЕ ИЗ ПАПКИ
  // ==========================================

  async function addFromFolder() {
    if (!selectedFolderFiles || selectedFolderFiles.length === 0) {
      setAddStatus('❌ Please select a folder first', 'error');
      return;
    }

    try {
      const indexFile = selectedFolderFiles.find(
        f => f.name.toLowerCase() === 'index.html'
      );

      if (!indexFile) {
        setAddStatus('❌ Folder must contain index.html', 'error');
        return;
      }

      setAddStatus(t('analyzing'), 'loading');

      const html = await indexFile.text();

      if (!/html/i.test(html)) {
        setAddStatus(t('notHtml'), 'error');
        return;
      }

      createByFactory(html, 'Added from folder');

    } catch (error) {
      console.error('Folder add error:', error);
      setAddStatus(`❌ ${error.message}`, 'error');
    }
  }

  // ==========================================
  // ДОБАВЛЕНИЕ ИЗ КОДА
  // ==========================================

  function addFromCode() {
    const codeInput = document.getElementById('code-input-textarea');

    if (!codeInput) return;

    const code = codeInput.value.trim();

    if (!code) {
      setAddStatus(t('enterCode'), 'error');
      return;
    }

    // Проверяем именно наличие слова html.
    // Если оно есть — отправляем код в app-factory.js.
    // app-factory.js сам:
    // - найдёт manifest
    // - если manifest нет, создаст его
    // - проверит id
    // - создаст приложение
    if (!/html/i.test(code)) {
      setAddStatus(t('notHtml'), 'error');
      return;
    }

    setAddStatus(t('analyzing'), 'loading');

    createByFactory(code, 'Added from code');
  }

  // ==========================================
  // ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ FILE INPUT
  // ==========================================

  function setupAddModuleListeners() {
    const localFileInput = document.getElementById('local-file-input');
    const folderInput = document.getElementById('folder-input');

    if (localFileInput && !localFileInput.dataset.addModuleBound) {
      localFileInput.addEventListener('change', handleLocalFileSelect);
      localFileInput.dataset.addModuleBound = 'true';
    }

    if (folderInput && !folderInput.dataset.addModuleBound) {
      folderInput.addEventListener('change', handleFolderSelect);
      folderInput.dataset.addModuleBound = 'true';
    }
  }

  // ==========================================
  // ЭКСПОРТ ФУНКЦИЙ В GLOBAL SCOPE
  // Нужно для app-events.js
  // ==========================================

  window.openAddModal = openAddModal;
  window.closeAddModal = closeAddModal;
  window.switchTab = switchTab;
  window.addModule = addModule;
  window.handleLocalFileSelect = handleLocalFileSelect;
  window.handleFolderSelect = handleFolderSelect;

  // На всякий случай оставляем совместимость с прямыми ссылками
  window.addFromUrl = addFromUrl;
  window.addFromLocalFile = addFromLocalFile;
  window.addFromFolder = addFromFolder;
  window.addFromCode = addFromCode;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAddModuleListeners);
  } else {
    setupAddModuleListeners();
  }
})();