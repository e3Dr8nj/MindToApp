// ==========================================
// ЯДРО ПЛАТФОРМЫ
// Инициализация, установка/удаление модулей,
// открытие/закрытие приложения, toast, модалка информации
// ==========================================

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

// ==========================================
// ЗАПУСК ПЛАТФОРМЫ
// ==========================================

init();