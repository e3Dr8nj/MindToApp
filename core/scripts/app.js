async function init() {
  initCustomThemes();
  initTheme();
  initAINetworks();
  initAINetworksInUI();
  loadAppUrls();
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  updatePromptPreview();
  applyLanguage();
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
  if (!confirm(t('deleteModule'))) return;
  const module = allModules.find(m => m.id === moduleId);
  if (module && module.isFolder) {
    try {
      await deleteFolderModule(moduleId);
      if (activeVirtualFS.has(moduleId)) {
        activeVirtualFS.get(moduleId).cleanup();
        activeVirtualFS.delete(moduleId);
      }
    } catch (error) {
      console.error(error);
    }
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
  } catch (e) {
    console.error(e);
  }
  setTimeout(() => window.location.reload(), 500);
}

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

function openAppInfoModal(module, isInstalled) {
  const modal = document.getElementById('app-info-modal');
  if (!modal) return;

  const iconEl = document.getElementById('app-info-icon');
  const nameEl = document.getElementById('app-info-name');
  const descEl = document.getElementById('app-info-desc');
  const titleEl = document.getElementById('app-info-title');

  if (iconEl) iconEl.textContent = module.icon;
  if (nameEl) nameEl.textContent = module.name;
  if (descEl) descEl.textContent = module.description || t('noDescription');
  if (titleEl) titleEl.textContent = module.name;

  const linkBlock = document.getElementById('app-info-link-block');
  if (linkBlock) {
    const linkedUrl = getAppUrl(module.id);
    if (linkedUrl) {
      linkBlock.style.display = 'block';
      linkBlock.innerHTML = `
        <div class="app-info-link-label">${t('linkedUrl')}</div>
        <a href="${escapeHtml(linkedUrl)}" target="_blank" rel="noopener noreferrer" class="app-info-link-url">${escapeHtml(linkedUrl)}</a>
      `;
    } else {
      linkBlock.style.display = 'none';
      linkBlock.innerHTML = '';
    }
  }

  const actions = document.getElementById('app-info-actions');
  if (actions) actions.innerHTML = '';

  modal.classList.add('active');
}

function closeAppInfoModal() {
  const modal = document.getElementById('app-info-modal');
  if (modal) modal.classList.remove('active');
}

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
  const response = await fetch(finalUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();

  if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<script id="manifest"')) {
    throw new Error(t('noHtmlAtUrl'));
  }
  return html;
}

async function createFromClipboard() {
  const createBtn = document.getElementById('sidebar-create-btn');

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast(t('browserNotSupported'), 'error');
    return;
  }

  try {
    if (createBtn) {
      createBtn.textContent = '⏳';
      createBtn.disabled = true;
    }

    showToast(t('reading'), 'info', 2000);
    const clipboardContent = await navigator.clipboard.readText();

    if (!clipboardContent || !clipboardContent.trim()) {
      showToast(t('emptyClipboard'), 'error');
      return;
    }

    let trimmedContent = clipboardContent.trim();
    let trimmedCode = trimmedContent;

    if (trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')) {
      showToast(t('loadingByUrl'), 'info', 2000);
      try {
        trimmedCode = await loadHTMLFromURL(trimmedContent);
        showToast(t('codeLoaded'), 'success', 2000);
      } catch (loadError) {
        console.error('Link load error:', loadError);
        showToast(t('loadFailed', { message: loadError.message }), 'error');
        return;
      }
    }

    if (!trimmedCode.includes('<html') && !trimmedCode.includes('<!DOCTYPE')) {
      showToast(t('noHtml'), 'error');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmedCode, 'text/html');
    const manifestScript = doc.getElementById('manifest');

    if (!manifestScript) {
      showToast(t('noManifest'), 'error');
      return;
    }

    const manifest = JSON.parse(manifestScript.textContent);

    if (!manifest.id || !manifest.name || !manifest.icon) {
      showToast(t('missingFields'), 'error');
      return;
    }

    if (allModules.some(m => m.id === manifest.id)) {
      showToast(t('appExists'), 'error');
      return;
    }

    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Created from clipboard',
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

    showToast(t('appCreated', { name: manifest.name }), 'success', 3000);
    renderInstalledApps();
    renderAllApps();

  } catch (error) {
    console.error('Clipboard creation error:', error);
    showToast(`❌ ${error.message}`, 'error');
  } finally {
    if (createBtn) {
      createBtn.innerHTML = t('create');
      createBtn.disabled = false;
    }
  }
}

async function handleUrlFromClipboard() {
  const urlBtn = document.getElementById('sidebar-url-btn');

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast(t('browserNotSupported'), 'error');
    return;
  }

  try {
    if (urlBtn) {
      urlBtn.textContent = '⏳';
      urlBtn.disabled = true;
    }

    showToast(t('reading'), 'info', 1500);
    const clipboardContent = await navigator.clipboard.readText();

    if (!clipboardContent || !clipboardContent.trim()) {
      showToast(t('emptyClipboard'), 'error');
      showClipboardScreen('');
      return;
    }

    const trimmedContent = clipboardContent.trim();
    const singleUrlPattern = /^https?:\/\/[^\s]+$/i;

    if (singleUrlPattern.test(trimmedContent)) {
      showToast(t('opening'), 'success', 1500);
      window.open(trimmedContent, '_blank', 'noopener,noreferrer');
      return;
    }

    showClipboardScreen(trimmedContent);

  } catch (error) {
    console.error('Clipboard read error:', error);
    showToast(`❌ ${error.message}`, 'error');
  } finally {
    if (urlBtn) {
      urlBtn.innerHTML = t('url');
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
        <p>${t('clipboardEmpty')}</p>
        <p style="font-size: 14px; color: var(--description-color); margin-top: 10px;">
          ${t('clipboardEmptyDesc')}
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
    showStatus(statusEl, t('enterIdea'), 'error');
    return;
  }

  const fullPrompt = `${getPrompt()}\n\n${idea}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = t('copied');
        setTimeout(() => copyBtn.textContent = t('copyPrompt'), 2000);
      }
      showStatus(statusEl, t('promptCopied'), 'success');
    }).catch(() => {
      showStatus(statusEl, t('copyFailed'), 'error');
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = fullPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = t('copied');
        setTimeout(() => copyBtn.textContent = t('copyPrompt'), 2000);
      }
      showStatus(statusEl, t('promptCopied'), 'success');
    } catch (e) {
      showStatus(statusEl, t('copyFailed'), 'error');
    }
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
  if (!code) {
    showStatus(statusEl, t('enterCode'), 'error');
    return;
  }
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    showStatus(statusEl, t('notHtml'), 'error');
    return;
  }

  showStatus(statusEl, t('analyzing'), 'loading');

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('No <script id="manifest"> in <head>');

    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) {
      throw new Error(t('missingFields'));
    }
    if (allModules.some(m => m.id === manifest.id)) {
      throw new Error(t('appExists'));
    }

    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Created via builder',
      content: code,
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
      content: code,
      url: URL.createObjectURL(new Blob([code], { type: 'text/html' })),
      isCustom: true,
      isLocal: true,
      isFolder: false
    });

    showStatus(statusEl, '✅', 'success');
    if (createBtn) {
      createBtn.textContent = t('created');
      setTimeout(() => {
        createBtn.textContent = t('createApp');
        closeBuilder();
        renderInstalledApps();
        renderAllApps();
      }, 1000);
    }
  } catch (error) {
    showStatus(statusEl, `❌ ${error.message}`, 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}
function setupEventListeners() {
  // ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
  const languageToggleBtn = document.getElementById('language-toggle-btn');
  if (languageToggleBtn) {
    languageToggleBtn.addEventListener('click', function() {
      if (typeof toggleLanguage === 'function') {
        toggleLanguage();
      }
    });
  }

  // БУРГЕР-МЕНЮ
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

  // НАВИГАЦИЯ
  const openStoreBtn = document.getElementById('open-store-btn');
  const backToHomeBtn = document.getElementById('back-to-home-btn');
  const goToStoreBtn = document.getElementById('go-to-store-btn');
  const closeAppBtn = document.getElementById('close-app-btn');

  if (openStoreBtn) openStoreBtn.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => showScreen(homeScreen));
  if (goToStoreBtn) goToStoreBtn.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  if (closeAppBtn) closeAppBtn.addEventListener('click', closeApp);

  // КОНСТРУКТОР
  const builderBtn = document.getElementById('builder-btn');
  const builderCloseBtn = document.getElementById('builder-close-btn');
  const builderCopyPromptBtn = document.getElementById('builder-copy-prompt-btn');
  const builderOpenAiBtn = document.getElementById('builder-open-ai-btn');
  const builderCreateBtn = document.getElementById('builder-create-btn');

  if (builderBtn) builderBtn.addEventListener('click', openBuilder);
  if (builderCloseBtn) builderCloseBtn.addEventListener('click', closeBuilder);
  if (builderCopyPromptBtn) builderCopyPromptBtn.addEventListener('click', copyBuilderPrompt);
  if (builderOpenAiBtn) builderOpenAiBtn.addEventListener('click', openSelectedAI);
  if (builderCreateBtn) builderCreateBtn.addEventListener('click', createFromBuilder);

  // РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ
  const toggleCodeBtn = document.getElementById('toggle-code-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const copyEditPromptBtn = document.getElementById('copy-edit-prompt-btn');
  const closeEditBtn = document.getElementById('close-edit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editModal = document.getElementById('edit-modal');

  if (toggleCodeBtn) toggleCodeBtn.addEventListener('click', () => {
    if (typeof toggleCodeVisibility === 'function') toggleCodeVisibility();
  });
  if (copyCodeBtn) copyCodeBtn.addEventListener('click', () => {
    if (typeof copyCodeFromEditModal === 'function') copyCodeFromEditModal();
  });
  if (copyEditPromptBtn) copyEditPromptBtn.addEventListener('click', () => {
    if (typeof copyEditPrompt === 'function') copyEditPrompt();
  });
  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
  if (editModal) editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // СТАРАЯ МОДАЛКА СОЗДАНИЯ
  const createAppBtn = document.getElementById('create-app-btn');
  const closeCreateBtn = document.getElementById('close-create-btn');
  const cancelCreateBtn = document.getElementById('cancel-create-btn');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const confirmCreateBtn = document.getElementById('confirm-create-btn');
  const createModal = document.getElementById('create-modal');
  const userIdeaInput = document.getElementById('user-idea-input');

  if (createAppBtn) createAppBtn.addEventListener('click', () => {
    if (typeof openCreateModal === 'function') openCreateModal();
  });
  if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeCreateModal);
  if (cancelCreateBtn) cancelCreateBtn.addEventListener('click', closeCreateModal);
  if (copyPromptBtn) copyPromptBtn.addEventListener('click', () => {
    const idea = userIdeaInput ? userIdeaInput.value.trim() : '';
    const fullPrompt = idea ? `${getPrompt()}\n\n${idea}` : getPrompt();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullPrompt).then(() => {
        showToast(t('promptCopied'), 'success');
      }).catch(() => {
        showToast(t('copyFailed'), 'error');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = fullPrompt;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast(t('promptCopied'), 'success');
      } catch (e) {
        showToast(t('copyFailed'), 'error');
      }
      document.body.removeChild(textarea);
    }
  });
  if (confirmCreateBtn) confirmCreateBtn.addEventListener('click', () => {
    if (typeof createAppFromText === 'function') createAppFromText();
  });
  if (createModal) createModal.addEventListener('click', (e) => {
    if (e.target === createModal) closeCreateModal();
  });
  if (userIdeaInput) userIdeaInput.addEventListener('input', updatePromptPreview);

  // КЭШ
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', refreshApp);

  // ДОБАВЛЕНИЕ МОДУЛЯ
  const addCustomBtn = document.getElementById('add-custom-btn');
  const addCustomBtnStore = document.getElementById('add-custom-btn-store');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const confirmAddBtn = document.getElementById('confirm-add-btn');
  const addModal = document.getElementById('add-modal');
  const moduleUrlInput = document.getElementById('module-url-input');
  const selectFileBtn = document.getElementById('select-file-btn');
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const localFileInput = document.getElementById('local-file-input');
  const folderInput = document.getElementById('folder-input');

  if (addCustomBtn) addCustomBtn.addEventListener('click', () => {
    if (typeof openAddModal === 'function') openAddModal();
  });
  if (addCustomBtnStore) addCustomBtnStore.addEventListener('click', () => {
    if (typeof openAddModal === 'function') openAddModal();
  });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeAddModal);
  if (confirmAddBtn) confirmAddBtn.addEventListener('click', () => {
    if (typeof addModule === 'function') addModule();
  });
  if (addModal) addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModal();
  });
  if (moduleUrlInput) moduleUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && typeof addModule === 'function') addModule();
  });
  if (selectFileBtn) selectFileBtn.addEventListener('click', () => {
    if (localFileInput) localFileInput.click();
  });
  if (selectFolderBtn) selectFolderBtn.addEventListener('click', () => {
    if (folderInput) folderInput.click();
  });

  // ШАРИНГ И ПРИВЯЗКА ССЫЛОК
  const closeShareBtn = document.getElementById('close-share-btn');
  const closeShareFooterBtn = document.getElementById('close-share-footer-btn');
  const copyAppCodeBtn = document.getElementById('copy-app-code-btn');
  const shareModal = document.getElementById('share-modal');
  const bindUrlBtn = document.getElementById('bind-url-btn');
  const unbindUrlBtn = document.getElementById('unbind-url-btn');

  if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
  if (closeShareFooterBtn) closeShareFooterBtn.addEventListener('click', closeShareModal);
  if (copyAppCodeBtn) copyAppCodeBtn.addEventListener('click', copyAppCode);
  if (shareModal) shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) closeShareModal();
  });
  if (bindUrlBtn) bindUrlBtn.addEventListener('click', bindUrlToApp);
  if (unbindUrlBtn) unbindUrlBtn.addEventListener('click', unbindUrlFromApp);

  // ЭКСПОРТ ССЫЛОК
  const exportUrlsBtn = document.getElementById('export-urls-btn');
  const closeExportUrlsBtn = document.getElementById('close-export-urls-btn');
  const closeExportUrlsFooterBtn = document.getElementById('close-export-urls-footer-btn');
  const copyExportUrlsBtn = document.getElementById('copy-export-urls-btn');
  const exportUrlsModal = document.getElementById('export-urls-modal');

  if (exportUrlsBtn) exportUrlsBtn.addEventListener('click', openExportUrlsModal);
  if (closeExportUrlsBtn) closeExportUrlsBtn.addEventListener('click', closeExportUrlsModal);
  if (closeExportUrlsFooterBtn) closeExportUrlsFooterBtn.addEventListener('click', closeExportUrlsModal);
  if (copyExportUrlsBtn) copyExportUrlsBtn.addEventListener('click', copyExportText);
  if (exportUrlsModal) exportUrlsModal.addEventListener('click', (e) => {
    if (e.target === exportUrlsModal) closeExportUrlsModal();
  });

  // ВКЛАДКИ
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof switchTab === 'function') switchTab(btn.dataset.target);
    });
  });

  // САЙДБАР: КОПИРОВАНИЕ ПРОМПТА
  const sidebarPromptBtn = document.getElementById('sidebar-prompt-btn');
  if (sidebarPromptBtn) {
    sidebarPromptBtn.addEventListener('click', () => {
      const promptTextValue = getPrompt();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(promptTextValue).then(() => {
          const btn = document.getElementById('sidebar-prompt-btn');
          if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅';
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
          }
          showToast(t('promptCopied'), 'success');
        }).catch(() => {
          showToast(t('copyFailed'), 'error');
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
          showToast(t('promptCopied'), 'success');
        } catch (e) {
          showToast(t('copyFailed'), 'error');
        }
        document.body.removeChild(textarea);
      }
    });
  }

  // САЙДБАР: СОЗДАНИЕ ИЗ БУФЕРА
  const sidebarCreateBtn = document.getElementById('sidebar-create-btn');
  if (sidebarCreateBtn) sidebarCreateBtn.addEventListener('click', createFromClipboard);

  // САЙДБАР: ОБРАБОТКА URL ИЗ БУФЕРА
  const sidebarUrlBtn = document.getElementById('sidebar-url-btn');
  if (sidebarUrlBtn) sidebarUrlBtn.addEventListener('click', handleUrlFromClipboard);

  // ЭКРАН БУФЕРА ОБМЕНА
  const closeClipboardScreenBtn = document.getElementById('close-clipboard-screen-btn');
  if (closeClipboardScreenBtn) closeClipboardScreenBtn.addEventListener('click', closeClipboardScreen);

  // ПАНЕЛЬ НЕЙРОСЕТЕЙ
  const aiPanelCloseBtn = document.getElementById('ai-panel-close-btn');
  if (aiPanelCloseBtn) aiPanelCloseBtn.addEventListener('click', closeAIPanel);

  // УПРАВЛЕНИЕ ТЕМАМИ
  const manageThemesBtn = document.getElementById('manage-themes-btn');
  const closeThemesBtn = document.getElementById('close-themes-btn');
  const closeThemesFooterBtn = document.getElementById('close-themes-footer-btn');
  const themesModal = document.getElementById('themes-modal');

  if (manageThemesBtn) manageThemesBtn.addEventListener('click', () => {
    const modal = document.getElementById('themes-modal');
    if (modal) {
      modal.classList.add('active');
      if (typeof renderCustomThemesList === 'function') renderCustomThemesList();
    }
  });
  if (closeThemesBtn) closeThemesBtn.addEventListener('click', () => {
    const modal = document.getElementById('themes-modal');
    if (modal) modal.classList.remove('active');
  });
  if (closeThemesFooterBtn) closeThemesFooterBtn.addEventListener('click', () => {
    const modal = document.getElementById('themes-modal');
    if (modal) modal.classList.remove('active');
  });
  if (themesModal) themesModal.addEventListener('click', (e) => {
    if (e.target === themesModal) themesModal.classList.remove('active');
  });

  // ДОБАВЛЕНИЕ ТЕМЫ
  const addThemeBtn = document.getElementById('add-theme-btn');
  const closeAddThemeBtn = document.getElementById('close-add-theme-btn');
  const cancelAddThemeBtn = document.getElementById('cancel-add-theme-btn');
  const copyThemeTemplateBtn = document.getElementById('copy-theme-template-btn');
  const submitThemeBtn = document.getElementById('submit-theme-btn');
  const addThemeModal = document.getElementById('add-theme-modal');

  if (addThemeBtn) addThemeBtn.addEventListener('click', () => {
    if (typeof openAddThemeModal === 'function') openAddThemeModal();
  });
  if (closeAddThemeBtn) closeAddThemeBtn.addEventListener('click', closeAddThemeModal);
  if (cancelAddThemeBtn) cancelAddThemeBtn.addEventListener('click', closeAddThemeModal);
  if (copyThemeTemplateBtn) copyThemeTemplateBtn.addEventListener('click', () => {
    if (typeof copyThemeTemplate === 'function') copyThemeTemplate();
  });
  if (submitThemeBtn) submitThemeBtn.addEventListener('click', () => {
    if (typeof submitCustomTheme === 'function') submitCustomTheme();
  });
  if (addThemeModal) addThemeModal.addEventListener('click', (e) => {
    if (e.target === addThemeModal) closeAddThemeModal();
  });

  // РЕДАКТОР ПРОМПТА
  const editPromptsBtn = document.getElementById('edit-prompts-btn');
  const closePromptsBtn = document.getElementById('close-prompts-btn');
  const savePromptBtn = document.getElementById('save-prompt-btn');
  const resetPromptBtn = document.getElementById('reset-prompt-btn');
  const promptsModal = document.getElementById('prompts-modal');

  if (editPromptsBtn) editPromptsBtn.addEventListener('click', openPromptsModal);
  if (closePromptsBtn) closePromptsBtn.addEventListener('click', closePromptsModal);
  if (savePromptBtn) savePromptBtn.addEventListener('click', savePrompt);
  if (resetPromptBtn) resetPromptBtn.addEventListener('click', resetPromptToDefault);
  if (promptsModal) promptsModal.addEventListener('click', (e) => {
    if (e.target === promptsModal) closePromptsModal();
  });

  // УПРАВЛЕНИЕ СПИСКОМ НЕЙРОСЕТЕЙ
  const manageAiBtn = document.getElementById('manage-ai-btn');
  const closeAiManagerBtn = document.getElementById('close-ai-manager-btn');
  const closeAiManagerFooterBtn = document.getElementById('close-ai-manager-footer-btn');
  const aiManagerModal = document.getElementById('ai-manager-modal');
  const addAiBtn = document.getElementById('add-ai-btn');
  const saveAiBtn = document.getElementById('save-ai-btn');
  const cancelAiEditBtn = document.getElementById('cancel-ai-edit-btn');
  const resetAiListBtn = document.getElementById('reset-ai-list-btn');

  if (manageAiBtn) manageAiBtn.addEventListener('click', openAIManagerModal);
  if (closeAiManagerBtn) closeAiManagerBtn.addEventListener('click', closeAIManagerModal);
  if (closeAiManagerFooterBtn) closeAiManagerFooterBtn.addEventListener('click', closeAIManagerModal);
  if (aiManagerModal) aiManagerModal.addEventListener('click', (e) => {
    if (e.target === aiManagerModal) closeAIManagerModal();
  });
  if (addAiBtn) addAiBtn.addEventListener('click', () => showAIEditor(null));
  if (saveAiBtn) saveAiBtn.addEventListener('click', saveAINetworkFromForm);
  if (cancelAiEditBtn) cancelAiEditBtn.addEventListener('click', hideAIEditor);
  if (resetAiListBtn) resetAiListBtn.addEventListener('click', resetAIList);

  // МОДАЛКА ИНФОРМАЦИИ О ПРИЛОЖЕНИИ
  const closeAppInfoBtn = document.getElementById('close-app-info-btn');
  const closeAppInfoFooterBtn = document.getElementById('close-app-info-footer-btn');
  const appInfoModal = document.getElementById('app-info-modal');

  if (closeAppInfoBtn) closeAppInfoBtn.addEventListener('click', closeAppInfoModal);
  if (closeAppInfoFooterBtn) closeAppInfoFooterBtn.addEventListener('click', closeAppInfoModal);
  if (appInfoModal) appInfoModal.addEventListener('click', (e) => {
    if (e.target === appInfoModal) closeAppInfoModal();
  });

  // ESCAPE — ЗАКРЫТИЕ ВСЕХ МОДАЛОК
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
      hideCardContextMenu();
      const themesModal = document.getElementById('themes-modal');
      if (themesModal) themesModal.classList.remove('active');
      if (headerMenu) headerMenu.classList.remove('active');
    }
  });
}

function showAIEditor(network) {
  const editorBox = document.getElementById('ai-editor-box');
  const title = document.getElementById('ai-editor-title');
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');

  if (!editorBox || !title || !idInput || !nameInput || !urlInput) return;

  editorBox.style.display = 'block';

  if (network) {
    title.textContent = t('editAI');
    idInput.value = network.id;
    nameInput.value = network.name;
    urlInput.value = network.url;
  } else {
    title.textContent = t('newAI');
    idInput.value = '';
    nameInput.value = '';
    urlInput.value = '';
  }
}

function saveAINetworkFromForm() {
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');
  const status = document.getElementById('ai-editor-status');

  if (!idInput || !nameInput || !urlInput) return;

  const id = idInput.value.trim();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!id || !name || !url) {
    if (status) { status.textContent = t('fillAllFields'); status.className = 'modal-status error'; }
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (status) { status.textContent = t('urlMustStart'); status.className = 'modal-status error'; }
    return;
  }

  const networks = getAINetworks();
  const existingIndex = networks.findIndex(n => n.id === id);

  const newNetwork = { id, name, url };

  if (existingIndex > -1) {
    networks[existingIndex] = newNetwork;
  } else {
    networks.push(newNetwork);
  }

  saveAINetworks(networks);

  if (status) { status.textContent = t('aiSaved'); status.className = 'modal-status success'; }

  setTimeout(() => {
    hideAIEditor();
    if (typeof renderAINetworksList === 'function') renderAINetworksList();
    if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
  }, 800);
}

function resetAIList() {
  if (!confirm(t('resetListConfirm'))) return;
  resetAINetworks();
  renderAINetworksList();
  if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
}

// ==========================================
// ЗАПУСК ПЛАТФОРМЫ
// ==========================================

init();