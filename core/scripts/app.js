async function init() {
  initCustomThemes();
  initTheme();
  initAINetworks();
  loadAppUrls();
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

// ==========================================
// ОТКРЫТИЕ/ЗАКРЫТИЕ ПРИЛОЖЕНИЯ + СКРЫТИЕ САЙДБАРА
// ==========================================

function openApp(module) {
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
  
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (sidebar) sidebar.classList.add('sidebar-hidden');
  if (mainContent) mainContent.style.marginLeft = '0';
}

function closeApp() {
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
  
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (sidebar) sidebar.classList.remove('sidebar-hidden');
  if (mainContent) mainContent.style.marginLeft = '';
}

async function refreshApp() {
  const btn = document.getElementById('refresh-btn');
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
  const container = document.getElementById('toast-container');
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
// МОДАЛКА ИНФОРМАЦИИ О ПРИЛОЖЕНИИ
// ==========================================

function openAppInfoModal(module, isInstalled) {
  const modal = document.getElementById('app-info-modal');
  if (!modal) return;

  document.getElementById('app-info-icon').textContent = module.icon;
  document.getElementById('app-info-name').textContent = module.name;
  document.getElementById('app-info-desc').textContent = module.description || 'Нет описания';
  document.getElementById('app-info-title').textContent = module.name;

  // Блок привязанной ссылки
  const linkBlock = document.getElementById('app-info-link-block');
  if (linkBlock) {
    const linkedUrl = getAppUrl(module.id);
    if (linkedUrl) {
      linkBlock.style.display = 'block';
      linkBlock.innerHTML = `
        <div class="app-info-link-label">🔗 Привязанная ссылка:</div>
        <a href="${escapeHtml(linkedUrl)}" target="_blank" rel="noopener noreferrer" class="app-info-link-url">${escapeHtml(linkedUrl)}</a>
      `;
    } else {
      linkBlock.style.display = 'none';
      linkBlock.innerHTML = '';
    }
  }

  const actions = document.getElementById('app-info-actions');
  actions.innerHTML = '';

  if (isInstalled) {
    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn-primary';
    openBtn.textContent = '🚀 Открыть';
    openBtn.onclick = () => { closeAppInfoModal(); openApp(module); };
    actions.appendChild(openBtn);

    if (module.isCustom) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn';
      removeBtn.style.background = 'var(--delete-btn-bg)';
      removeBtn.style.color = 'white';
      removeBtn.textContent = '🗑 Удалить модуль';
      removeBtn.onclick = () => { closeAppInfoModal(); removeCustomModule(module.id); };
      actions.appendChild(removeBtn);
    } else {
      const uninstallBtn = document.createElement('button');
      uninstallBtn.className = 'btn';
      uninstallBtn.style.background = 'var(--delete-btn-bg)';
      uninstallBtn.style.color = 'white';
      uninstallBtn.textContent = '❌ Удалить';
      uninstallBtn.onclick = () => { closeAppInfoModal(); toggleInstall(module.id); };
      actions.appendChild(uninstallBtn);
    }

    if (module.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = '✏️ Редактировать';
      editBtn.onclick = () => { closeAppInfoModal(); openEditModal(module); };
      actions.appendChild(editBtn);

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-secondary';
      shareBtn.textContent = '📤 Поделиться';
      shareBtn.onclick = () => { closeAppInfoModal(); openShareModal(module); };
      actions.appendChild(shareBtn);
    }
  } else {
    const installBtn = document.createElement('button');
    installBtn.className = 'btn btn-primary';
    installBtn.textContent = '✅ Установить';
    installBtn.onclick = () => { closeAppInfoModal(); toggleInstall(module.id); };
    actions.appendChild(installBtn);
  }

  modal.classList.add('active');
}

function closeAppInfoModal() {
  const modal = document.getElementById('app-info-modal');
  if (modal) modal.classList.remove('active');
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
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
  const createBtn = document.getElementById('sidebar-create-btn');

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
// ОБРАБОТКА URL ИЗ БУФЕРА ОБМЕНА
// ==========================================

async function handleUrlFromClipboard() {
  const urlBtn = document.getElementById('sidebar-url-btn');
  
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast('❌ Ваш браузер не поддерживает чтение буфера обмена', 'error');
    return;
  }
  
  try {
    if (urlBtn) {
      urlBtn.textContent = '⏳';
      urlBtn.disabled = true;
    }
    
    showToast('📋 Чтение буфера обмена...', 'info', 1500);
    
    const clipboardContent = await navigator.clipboard.readText();
    
    if (!clipboardContent || !clipboardContent.trim()) {
      showToast('❌ Буфер обмена пуст', 'error');
      showClipboardScreen('');
      return;
    }
    
    const trimmedContent = clipboardContent.trim();
    
    const singleUrlPattern = /^https?:\/\/[^\s]+$/i;
    if (singleUrlPattern.test(trimmedContent)) {
      showToast('🔗 Открываю URL...', 'success', 1500);
      window.open(trimmedContent, '_blank', 'noopener,noreferrer');
      return;
    }
    
    showClipboardScreen(trimmedContent);
    
  } catch (error) {
    console.error('Ошибка чтения буфера:', error);
    showToast(`❌ Ошибка: ${error.message}`, 'error');
  } finally {
    if (urlBtn) {
      urlBtn.innerHTML = '🔗 URL';
      urlBtn.disabled = false;
    }
  }
}

function showClipboardScreen(content) {
  const screen = document.getElementById('clipboard-screen');
  const contentArea = document.getElementById('clipboard-content-area');
  
  if (!screen || !contentArea) return;
  
  if (!content || !content.trim()) {
    contentArea.innerHTML = `
      <div class="clipboard-empty">
        <p>📋 Буфер обмена пуст</p>
        <p style="font-size: 14px; color: var(--description-color); margin-top: 10px;">
          Скопируйте текст или ссылку и нажмите кнопку снова
        </p>
      </div>
    `;
  } else {
    contentArea.innerHTML = `
      <div class="clipboard-wrapper">
        <div class="clipboard-text">
          <div class="clipboard-pre">${makeUrlsClickable(content)}</div>
        </div>
      </div>
    `;
  }
  
  showScreen(screen);
}

function makeUrlsClickable(text) {
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  
  let result = '';
  let lastIndex = 0;
  let match;
  
  urlPattern.lastIndex = 0;
  
  while ((match = urlPattern.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    result += escapeHtml(beforeText);
    
    let url = match[0];
    let trailing = '';
    const trailingMatch = url.match(/([.,;:!?)\]}]+)$/);
    if (trailingMatch) {
      trailing = trailingMatch[1];
      url = url.slice(0, -trailing.length);
    }
    
    const escapedUrl = escapeHtml(url);
    result += `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="clipboard-inline-link">${escapedUrl}</a>`;
    
    if (trailing) {
      result += escapeHtml(trailing);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  result += escapeHtml(text.slice(lastIndex));
  
  return result;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function closeClipboardScreen() {
  showScreen(homeScreen);
}

// ==========================================
// ПАНЕЛЬ НЕЙРОСЕТЕЙ
// ==========================================

function openAIPanel() {
  const aiPanel = document.getElementById('ai-panel');
  if (!aiPanel) return;
  aiPanel.style.display = 'block';
  setTimeout(() => { aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

function closeAIPanel() {
  const aiPanel = document.getElementById('ai-panel');
  if (aiPanel) aiPanel.style.display = 'none';
}

// ==========================================
// КОНСТРУКТОР ПРИЛОЖЕНИЙ
// ==========================================

function openBuilder() {
  const ideaInput = document.getElementById('builder-idea-input');
  const codeInput = document.getElementById('builder-code-input');
  const status1 = document.getElementById('builder-status-1');
  const status3 = document.getElementById('builder-status-3');

  if (ideaInput) ideaInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status1) { status1.textContent = ''; status1.className = 'modal-status'; }
  if (status3) { status3.textContent = ''; status3.className = 'modal-status'; }

  const builderPanel = document.getElementById('builder-panel');
  if (builderPanel) builderPanel.style.display = 'block';

  setTimeout(() => {
    if (builderPanel) builderPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function closeBuilder() {
  const builderPanel = document.getElementById('builder-panel');
  if (builderPanel) builderPanel.style.display = 'none';
}

function copyBuilderPrompt() {
  const ideaInput = document.getElementById('builder-idea-input');
  const statusEl = document.getElementById('builder-status-1');
  const copyBtn = document.getElementById('builder-copy-prompt-btn');

  if (!ideaInput) return;
  const idea = ideaInput.value.trim();
  if (!idea) {
    showStatus(statusEl, '❌ Сначала опишите идею приложения', 'error');
    return;
  }

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
  const selectEl = document.getElementById('builder-ai-select');
  if (!selectEl) return;
  const url = selectEl.value;
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function createFromBuilder() {
  const codeInput = document.getElementById('builder-code-input');
  const statusEl = document.getElementById('builder-status-3');
  const createBtn = document.getElementById('builder-create-btn');

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
  // Бургер-меню (мобильные)
  const burgerBtn = document.getElementById('burger-menu-btn');
  const headerMenu = document.getElementById('header-menu');

  if (burgerBtn && headerMenu) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      headerMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!headerMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
        headerMenu.classList.remove('active');
      }
    });

    headerMenu.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        headerMenu.classList.remove('active');
      });
    });
  }

  // Навигация
  document.getElementById('open-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  document.getElementById('back-to-home-btn')?.addEventListener('click', () => showScreen(homeScreen));
  document.getElementById('go-to-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  document.getElementById('close-app-btn')?.addEventListener('click', closeApp);

  // Конструктор
  document.getElementById('builder-btn')?.addEventListener('click', openBuilder);
  document.getElementById('builder-close-btn')?.addEventListener('click', closeBuilder);
  document.getElementById('builder-copy-prompt-btn')?.addEventListener('click', copyBuilderPrompt);
  document.getElementById('builder-open-ai-btn')?.addEventListener('click', openSelectedAI);
  document.getElementById('builder-create-btn')?.addEventListener('click', createFromBuilder);

  // Старая модалка создания
  document.getElementById('create-app-btn')?.addEventListener('click', openCreateModal);
  document.getElementById('close-create-btn')?.addEventListener('click', closeCreateModal);
  document.getElementById('cancel-create-btn')?.addEventListener('click', closeCreateModal);
  document.getElementById('copy-prompt-btn')?.addEventListener('click', copyPrompt);
  document.getElementById('confirm-create-btn')?.addEventListener('click', createAppFromText);
  document.getElementById('create-modal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('create-modal')) closeCreateModal(); });
  document.getElementById('user-idea-input')?.addEventListener('input', updatePromptPreview);

  // Кэш
  document.getElementById('refresh-btn')?.addEventListener('click', refreshApp);

  // Добавление модуля
  document.getElementById('add-custom-btn')?.addEventListener('click', openAddModal);
  document.getElementById('add-custom-btn-store')?.addEventListener('click', openAddModal);
  document.getElementById('close-modal-btn')?.addEventListener('click', closeAddModal);
  document.getElementById('cancel-modal-btn')?.addEventListener('click', closeAddModal);
  document.getElementById('confirm-add-btn')?.addEventListener('click', addModule);
  document.getElementById('add-modal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('add-modal')) closeAddModal(); });
  document.getElementById('module-url-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  document.getElementById('select-file-btn')?.addEventListener('click', () => document.getElementById('local-file-input')?.click());
  document.getElementById('select-folder-btn')?.addEventListener('click', () => document.getElementById('folder-input')?.click());

  // Шаринг и привязка ссылок
  document.getElementById('close-share-btn')?.addEventListener('click', closeShareModal);
  document.getElementById('close-share-footer-btn')?.addEventListener('click', closeShareModal);
  document.getElementById('copy-app-code-btn')?.addEventListener('click', copyAppCode);
  document.getElementById('share-modal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('share-modal')) closeShareModal(); });
  document.getElementById('bind-url-btn')?.addEventListener('click', bindUrlToApp);
  document.getElementById('unbind-url-btn')?.addEventListener('click', unbindUrlFromApp);

  // Экспорт ссылок
  document.getElementById('export-urls-btn')?.addEventListener('click', openExportUrlsModal);
  document.getElementById('close-export-urls-btn')?.addEventListener('click', closeExportUrlsModal);
  document.getElementById('close-export-urls-footer-btn')?.addEventListener('click', closeExportUrlsModal);
  document.getElementById('copy-export-urls-btn')?.addEventListener('click', copyExportText);
  document.getElementById('export-urls-modal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('export-urls-modal')) closeExportUrlsModal(); });

  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Сайдбар: копирование промпта
  document.getElementById('sidebar-prompt-btn')?.addEventListener('click', () => {
    const promptTextValue = getPrompt('EDIT_PROMPT_INSTRUCTION');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(promptTextValue).then(() => {
        const btn = document.getElementById('sidebar-prompt-btn');
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
      textarea.value = promptTextValue;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        const btn = document.getElementById('sidebar-prompt-btn');
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

  // Сайдбар: создание из буфера
  document.getElementById('sidebar-create-btn')?.addEventListener('click', createFromClipboard);

  // Сайдбар: обработка URL из буфера
  document.getElementById('sidebar-url-btn')?.addEventListener('click', handleUrlFromClipboard);

  // Экран буфера обмена
  document.getElementById('close-clipboard-screen-btn')?.addEventListener('click', closeClipboardScreen);

  // Панель нейросетей
  document.getElementById('ai-panel-close-btn')?.addEventListener('click', closeAIPanel);

  // Управление темами
  document.getElementById('manage-themes-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('themes-modal');
    if (modal) {
      modal.classList.add('active');
      renderCustomThemesList();
    }
  });
  document.getElementById('close-themes-btn')?.addEventListener('click', () => document.getElementById('themes-modal')?.classList.remove('active'));
  document.getElementById('close-themes-footer-btn')?.addEventListener('click', () => document.getElementById('themes-modal')?.classList.remove('active'));
  document.getElementById('themes-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('themes-modal')) document.getElementById('themes-modal').classList.remove('active');
  });

  // Добавление темы
  document.getElementById('add-theme-btn')?.addEventListener('click', openAddThemeModal);
  document.getElementById('close-add-theme-btn')?.addEventListener('click', closeAddThemeModal);
  document.getElementById('cancel-add-theme-btn')?.addEventListener('click', closeAddThemeModal);
  document.getElementById('copy-theme-template-btn')?.addEventListener('click', copyThemeTemplate);
  document.getElementById('submit-theme-btn')?.addEventListener('click', submitCustomTheme);
  document.getElementById('add-theme-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('add-theme-modal')) closeAddThemeModal();
  });

  // Редактор промптов
  document.getElementById('edit-prompts-btn')?.addEventListener('click', openPromptsModal);
  document.getElementById('close-prompts-btn')?.addEventListener('click', closePromptsModal);
  document.getElementById('prompts-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('prompts-modal')) closePromptsModal();
  });

  // Управление списком нейросетей
  document.getElementById('manage-ai-btn')?.addEventListener('click', openAIManagerModal);
  document.getElementById('close-ai-manager-btn')?.addEventListener('click', closeAIManagerModal);
  document.getElementById('close-ai-manager-footer-btn')?.addEventListener('click', closeAIManagerModal);
  document.getElementById('ai-manager-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('ai-manager-modal')) closeAIManagerModal();
  });
  document.getElementById('add-ai-btn')?.addEventListener('click', () => showAIEditor(null));
  document.getElementById('save-ai-btn')?.addEventListener('click', saveAINetworkFromForm);
  document.getElementById('cancel-ai-edit-btn')?.addEventListener('click', hideAIEditor);
  document.getElementById('reset-ai-list-btn')?.addEventListener('click', resetAIList);

  // Модалка информации о приложении
  document.getElementById('close-app-info-btn')?.addEventListener('click', closeAppInfoModal);
  document.getElementById('close-app-info-footer-btn')?.addEventListener('click', closeAppInfoModal);
  document.getElementById('app-info-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('app-info-modal')) closeAppInfoModal();
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCreateModal();
      closeAddModal();
      closeShareModal();
      closeBuilder();
      closeAIPanel();
      closeAddThemeModal();
      closePromptsModal();
      closeAIManagerModal();
      closeAppInfoModal();
      closeClipboardScreen();
      closeExportUrlsModal();
      const themesModal = document.getElementById('themes-modal');
      if (themesModal) themesModal.classList.remove('active');
      if (headerMenu) headerMenu.classList.remove('active');
    }
  });
}

// Запуск платформы
init();