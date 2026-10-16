async function init() {
  initCustomThemes();
  initTheme();
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  updatePromptPreview();
}

function toggleInstall(moduleId) {
  const index = installedModules.indexOf(moduleId);
  if (index > -1) installedModules.splice(index, 1);
  else installedModules.push(moduleId);
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

async function removeCustomModule(moduleId) {
  if (!confirm('Удалить этот модуль?')) return;
  const module = allModules.find(m => m.id === moduleId);
  if (module && module.isFolder) {
    try {
      await deleteFolderModule(moduleId);
      if (activeVirtualFS.has(moduleId)) { activeVirtualFS.get(moduleId).cleanup(); activeVirtualFS.delete(moduleId); }
    } catch (error) { console.error(error); }
  }
  customModules = customModules.filter(m => m.id !== moduleId);
  installedModules = installedModules.filter(id => id !== moduleId);
  localStorage.setItem('customModules', JSON.stringify(customModules));
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  allModules = allModules.filter(m => m.id !== moduleId);
  renderInstalledApps();
  renderAllApps();
}

function openApp(module) {
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
}

function closeApp() {
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
}

async function refreshApp() {
  const btn = $('refresh-btn');
  if (btn) btn.textContent = '⏳';
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) { console.error(e); }
  setTimeout(() => window.location.reload(), 500);
}

// ==========================================
// TOAST УВЕДОМЛЕНИЯ
// ==========================================

function showToast(message, type = 'info', duration = 3000) {
  const container = $('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// ==========================================
// ЗАГРУЗКА ПО ССЫЛКЕ
// ==========================================

function convertGistToRaw(url) {
  if (url.includes('gist.github.com') && !url.includes('gist.githubusercontent.com')) {
    return url.replace('gist.github.com', 'gist.githubusercontent.com').replace(/\/?$/, '/raw');
  }
  if (url.includes('gist.githubusercontent.com') && !url.includes('/raw')) {
    return url.replace(/\/?$/, '/raw');
  }
  return url;
}

async function loadHTMLFromURL(url) {
  const finalUrl = convertGistToRaw(url);
  console.log('📥 Загружаю по ссылке:', finalUrl);
  
  const response = await fetch(finalUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const html = await response.text();
  
  if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<script id="manifest"')) {
    throw new Error('По ссылке нет HTML-кода');
  }
  
  return html;
}

// ==========================================
// СОЗДАНИЕ ИЗ БУФЕРА ОБМЕНА
// ==========================================

async function createFromClipboard() {
  const createBtn = $('sidebar-create-btn');
  
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast('❌ Ваш браузер не поддерживает чтение буфера обмена', 'error');
    return;
  }
  
  try {
    if (createBtn) {
      createBtn.textContent = '⏳';
      createBtn.disabled = true;
    }
    
    showToast('📋 Чтение буфера обмена...', 'info', 2000);
    
    const clipboardContent = await navigator.clipboard.readText();
    
    if (!clipboardContent || !clipboardContent.trim()) {
      showToast('❌ Буфер обмена пуст', 'error');
      return;
    }
    
    let trimmedContent = clipboardContent.trim();
    let trimmedCode = trimmedContent;
    
    if (trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')) {
      showToast('🔗 Загружаю по ссылке...', 'info', 2000);
      
      try {
        trimmedCode = await loadHTMLFromURL(trimmedContent);
        showToast('✅ Код загружен по ссылке', 'success', 2000);
      } catch (loadError) {
        console.error('Ошибка загрузки по ссылке:', loadError);
        showToast(`❌ Не удалось загрузить: ${loadError.message}`, 'error');
        return;
      }
    }
    
    if (!trimmedCode.includes('<html') && !trimmedCode.includes('<!DOCTYPE')) {
      showToast('❌ В буфере нет HTML-кода', 'error');
      return;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmedCode, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) {
      showToast('❌ Не найден manifest в коде', 'error');
      return;
    }
    
    const manifest = JSON.parse(manifestScript.textContent);
    
    if (!manifest.id || !manifest.name || !manifest.icon) {
      showToast('❌ В manifest не хватает полей', 'error');
      return;
    }
    
    if (allModules.some(m => m.id === manifest.id)) {
      showToast('❌ Приложение с таким ID уже есть', 'error');
      return;
    }
    
    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Создано из буфера',
      content: trimmedCode,
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
      content: trimmedCode,
      url: URL.createObjectURL(new Blob([trimmedCode], { type: 'text/html' })),
      isCustom: true,
      isLocal: true,
      isFolder: false
    });
    
    showToast(`✅ "${manifest.name}" создано!`, 'success', 3000);
    renderInstalledApps();
    renderAllApps();
    
  } catch (error) {
    console.error('Ошибка создания из буфера:', error);
    showToast(`❌ Ошибка: ${error.message}`, 'error');
  } finally {
    if (createBtn) {
      createBtn.innerHTML = '🚀 Создать';
      createBtn.disabled = false;
    }
  }
}

// ==========================================
// ВЕРХНЯЯ ДОПОЛНИТЕЛЬНАЯ ОБЛАСТЬ: ПАНЕЛЬ НЕЙРОСЕТЕЙ
// ==========================================

function openAIPanel() {
  const aiPanel = $('ai-panel');
  if (!aiPanel) return;
  aiPanel.style.display = 'block';
  setTimeout(() => { aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

function closeAIPanel() {
  const aiPanel = $('ai-panel');
  if (aiPanel) aiPanel.style.display = 'none';
}

// ==========================================
// КОНСТРУКТОР ПРИЛОЖЕНИЙ (ПАНЕЛЬ)
// ==========================================

function openBuilder() {
  const ideaInput = $('builder-idea-input');
  const codeInput = $('builder-code-input');
  const status1 = $('builder-status-1');
  const status3 = $('builder-status-3');
  
  if (ideaInput) ideaInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status1) { status1.textContent = ''; status1.className = 'modal-status'; }
  if (status3) { status3.textContent = ''; status3.className = 'modal-status'; }
  
  const builderPanel = $('builder-panel');
  if (builderPanel) builderPanel.style.display = 'block';
  
  setTimeout(() => {
    if (builderPanel) builderPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function closeBuilder() {
  const builderPanel = $('builder-panel');
  if (builderPanel) builderPanel.style.display = 'none';
}

function copyBuilderPrompt() {
  const ideaInput = $('builder-idea-input');
  const statusEl = $('builder-status-1');
  const copyBtn = $('builder-copy-prompt-btn');
  
  if (!ideaInput) return;
  const idea = ideaInput.value.trim();
  if (!idea) {
    showStatus(statusEl, '❌ Сначала опишите идею приложения', 'error');
    return;
  }
  
  // Используем getPrompt() из prompts.js
  const fullPrompt = getPrompt('BASE_PROMPT') + idea + getPrompt('BUILDER_PLATFORM_INSTRUCTION');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000);
      }
      showStatus(statusEl, '✅ Промпт скопирован! Теперь вставьте его в нейросеть.', 'success');
    }).catch(() => { showStatus(statusEl, '❌ Не удалось скопировать', 'error'); });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = fullPrompt;
    textarea.style.position = 'fixed'; textarea.style.opacity = '0';
    document.body.appendChild(textarea); textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000);
      }
      showStatus(statusEl, '✅ Промпт скопирован! Теперь вставьте его в нейросеть.', 'success');
    } catch (e) { showStatus(statusEl, '❌ Не удалось скопировать', 'error'); }
    document.body.removeChild(textarea);
  }
}

function openSelectedAI() {
  const selectEl = $('builder-ai-select');
  if (!selectEl) return;
  const url = selectEl.value;
  if (url) window.open(url, '_blank');
}

function createFromBuilder() {
  const codeInput = $('builder-code-input');
  const statusEl = $('builder-status-3');
  const createBtn = $('builder-create-btn');
  
  if (!codeInput || !statusEl) return;
  const code = codeInput.value.trim();
  if (!code) { showStatus(statusEl, '❌ Вставьте HTML-код от нейросети', 'error'); return; }
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) { showStatus(statusEl, '❌ Это не похоже на HTML-код', 'error'); return; }
  
  showStatus(statusEl, '⏳ Анализ кода...', 'loading');
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest"> в <head>');
    
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('В manifest не хватает полей id, name или icon');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует');
    
    const newModule = {
      id: manifest.id, name: manifest.name, icon: manifest.icon,
      description: manifest.description || 'Создано через конструктор',
      content: code, isCustom: true, isLocal: true, isFolder: false
    };
    
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    
    allModules.push({ ...manifest, content: code, url: URL.createObjectURL(new Blob([code], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
    
    showStatus(statusEl, '✅ Приложение успешно создано!', 'success');
    if (createBtn) {
      createBtn.textContent = '✅ Создано!';
      setTimeout(() => {
        createBtn.textContent = '🚀 Создать приложение';
        closeBuilder();
        renderInstalledApps();
        renderAllApps();
      }, 1000);
    }
  } catch (error) {
    showStatus(statusEl, `❌ Ошибка: ${error.message}`, 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}

// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

function setupEventListeners() {
  $('open-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('back-to-home-btn')?.addEventListener('click', () => showScreen(homeScreen));
  $('go-to-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('close-app-btn')?.addEventListener('click', closeApp);

  $('theme-toggle-btn')?.addEventListener('click', cycleTheme);

  $('builder-btn')?.addEventListener('click', openBuilder);
  $('builder-close-btn')?.addEventListener('click', closeBuilder);
  $('builder-copy-prompt-btn')?.addEventListener('click', copyBuilderPrompt);
  $('builder-open-ai-btn')?.addEventListener('click', openSelectedAI);
  $('builder-create-btn')?.addEventListener('click', createFromBuilder);

  $('create-app-btn')?.addEventListener('click', openCreateModal);
  $('close-create-btn')?.addEventListener('click', closeCreateModal);
  $('cancel-create-btn')?.addEventListener('click', closeCreateModal);
  $('copy-prompt-btn')?.addEventListener('click', copyPrompt);
  $('confirm-create-btn')?.addEventListener('click', createAppFromText);
  createModal?.addEventListener('click', (e) => { if (e.target === createModal) closeCreateModal(); });
  userIdeaInput?.addEventListener('input', updatePromptPreview);

  $('refresh-btn')?.addEventListener('click', refreshApp);

  $('add-custom-btn')?.addEventListener('click', openAddModal);
  $('add-custom-btn-store')?.addEventListener('click', openAddModal);
  $('close-modal-btn')?.addEventListener('click', closeAddModal);
  $('cancel-modal-btn')?.addEventListener('click', closeAddModal);
  $('confirm-add-btn')?.addEventListener('click', addModule);
  addModal?.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
  moduleUrlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  $('select-file-btn')?.addEventListener('click', () => localFileInput?.click());
  $('select-folder-btn')?.addEventListener('click', () => folderInput?.click());

  $('close-share-btn')?.addEventListener('click', closeShareModal);
  $('close-share-footer-btn')?.addEventListener('click', closeShareModal);
  $('copy-app-code-btn')?.addEventListener('click', copyAppCode);
  $('open-gist-btn')?.addEventListener('click', openGistWithCode);
  const shareModalEl = $('share-modal');
  if (shareModalEl) {
    shareModalEl.addEventListener('click', (e) => { if (e.target === shareModalEl) closeShareModal(); });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  $('sidebar-prompt-btn')?.addEventListener('click', () => {
    const promptText = getPrompt('EDIT_PROMPT_INSTRUCTION');
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptText).then(() => {
        const btn = $('sidebar-prompt-btn');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = '✅';
          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
        showToast('✅ Промпт-инструкция скопирована', 'success');
      }).catch(() => {
        showToast('❌ Не удалось скопировать промпт', 'error');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = promptText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        const btn = $('sidebar-prompt-btn');
        if (btn) {
          const originalText = btn.innerHTML;
          btn.innerHTML = '✅';
          setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
        showToast('✅ Промпт-инструкция скопирована', 'success');
      } catch (e) {
        showToast('❌ Не удалось скопировать промпт', 'error');
      }
      document.body.removeChild(textarea);
    }
  });

  $('sidebar-create-btn')?.addEventListener('click', createFromClipboard);

  $('manage-themes-btn')?.addEventListener('click', () => {
    const modal = $('themes-modal');
    if (modal) {
      modal.classList.add('active');
      renderCustomThemesList();
    }
  });

  $('close-themes-btn')?.addEventListener('click', () => {
    const modal = $('themes-modal');
    if (modal) modal.classList.remove('active');
  });

  $('close-themes-footer-btn')?.addEventListener('click', () => {
    const modal = $('themes-modal');
    if (modal) modal.classList.remove('active');
  });

  $('themes-modal')?.addEventListener('click', (e) => {
    if (e.target === $('themes-modal')) {
      $('themes-modal').classList.remove('active');
    }
  });

  $('add-theme-btn')?.addEventListener('click', openAddThemeModal);
  $('close-add-theme-btn')?.addEventListener('click', closeAddThemeModal);
  $('cancel-add-theme-btn')?.addEventListener('click', closeAddThemeModal);
  $('copy-theme-template-btn')?.addEventListener('click', copyThemeTemplate);
  $('submit-theme-btn')?.addEventListener('click', submitCustomTheme);

  $('add-theme-modal')?.addEventListener('click', (e) => {
    if (e.target === $('add-theme-modal')) {
      closeAddThemeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { 
      closeCreateModal(); 
      closeAddModal(); 
      closeShareModal(); 
      closeBuilder(); 
      closeAIPanel();
      closeAddThemeModal();
      const themesModal = $('themes-modal');
      if (themesModal) themesModal.classList.remove('active');
    }
  });
}

init();