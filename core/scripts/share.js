// ==========================================
// ШАРИНГ И ПРИВЯЗКА ССЫЛОК
// ==========================================

let currentShareModule = null;
let appUrlBindings = {};

// ==========================================
// ХРАНЕНИЕ ПРИВЯЗАННЫХ ССЫЛОК
// ==========================================

function loadAppUrls() {
  try {
    const stored = localStorage.getItem('appUrls');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        appUrlBindings = parsed;
      }
    }
  } catch (e) {
    console.error('Error loading appUrls:', e);
    appUrlBindings = {};
  }
}

function saveAppUrls() {
  localStorage.setItem('appUrls', JSON.stringify(appUrlBindings));
}

function getAppUrl(moduleId) {
  return appUrlBindings[moduleId] || null;
}

function setAppUrl(moduleId, url) {
  appUrlBindings[moduleId] = url;
  saveAppUrls();
}

function removeAppUrl(moduleId) {
  delete appUrlBindings[moduleId];
  saveAppUrls();
}

// ==========================================
// МОДАЛКА "ПОДЕЛИТЬСЯ"
// ==========================================

function openShareModal(module) {
  currentShareModule = module;
  const modal = document.getElementById('share-modal');
  if (!modal) return;

  const iconEl = document.getElementById('share-preview-icon');
  const nameEl = document.getElementById('share-preview-name');
  const descEl = document.getElementById('share-preview-desc');
  if (iconEl) iconEl.textContent = module.icon;
  if (nameEl) nameEl.textContent = module.name;
  if (descEl) descEl.textContent = module.description || t('noDescription');

  const status = document.getElementById('copy-code-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  const urlInput = document.getElementById('share-url-input');
  const bindBtn = document.getElementById('bind-url-btn');
  const unbindBtn = document.getElementById('unbind-url-btn');
  const urlStatus = document.getElementById('share-url-status');

  if (urlInput && bindBtn && unbindBtn) {
    const existingUrl = getAppUrl(module.id);

    if (existingUrl) {
      urlInput.value = existingUrl;
      // Используем переводы напрямую — эмодзи уже встроены в t('edit')
      bindBtn.textContent = t('edit');
      unbindBtn.style.display = 'inline-block';
      unbindBtn.textContent = t('unbindUrl');
    } else {
      urlInput.value = '';
      bindBtn.textContent = t('bindUrl');
      unbindBtn.style.display = 'none';
    }

    if (urlStatus) { urlStatus.textContent = ''; urlStatus.className = 'modal-status'; }
  }

  modal.classList.add('active');
}

function closeShareModal() {
  const modal = document.getElementById('share-modal');
  if (modal) modal.classList.remove('active');
  currentShareModule = null;
}

function copyAppCode() {
  if (!currentShareModule || !currentShareModule.content) {
    const status = document.getElementById('copy-code-status');
    if (status) { status.textContent = t('noCode'); status.className = 'modal-status error'; }
    return;
  }

  const status = document.getElementById('copy-code-status');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentShareModule.content).then(() => {
      if (status) { status.textContent = t('codeCopied'); status.className = 'modal-status success'; }
    }).catch(() => {
      fallbackCopy(currentShareModule.content, status);
    });
  } else {
    fallbackCopy(currentShareModule.content, status);
  }
}

function fallbackCopy(text, statusEl) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (statusEl) { statusEl.textContent = t('codeCopied'); statusEl.className = 'modal-status success'; }
  } catch (e) {
    if (statusEl) { statusEl.textContent = t('copyFailed'); statusEl.className = 'modal-status error'; }
  }
  document.body.removeChild(textarea);
}

function openGistWithCode() {
  window.open('https://gist.github.com', '_blank', 'noopener,noreferrer');
}

// ==========================================
// ПРИВЯЗКА / ОТВЯЗКА ССЫЛКИ
// ==========================================

function bindUrlToApp() {
  if (!currentShareModule) return;

  const urlInput = document.getElementById('share-url-input');
  const bindBtn = document.getElementById('bind-url-btn');
  const unbindBtn = document.getElementById('unbind-url-btn');
  const status = document.getElementById('share-url-status');

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

  setAppUrl(currentShareModule.id, url);

  if (status) { status.textContent = t('urlBound'); status.className = 'modal-status success'; }
  // Используем переводы напрямую — эмодзи уже встроены в t('edit') и t('unbindUrl')
  if (bindBtn) bindBtn.textContent = t('edit');
  if (unbindBtn) {
    unbindBtn.style.display = 'inline-block';
    unbindBtn.textContent = t('unbindUrl');
  }

  renderInstalledApps();
  renderAllApps();
}

function unbindUrlFromApp() {
  if (!currentShareModule) return;

  if (!confirm(t('unbindUrl') + '?')) return;

  removeAppUrl(currentShareModule.id);

  const urlInput = document.getElementById('share-url-input');
  const bindBtn = document.getElementById('bind-url-btn');
  const unbindBtn = document.getElementById('unbind-url-btn');
  const status = document.getElementById('share-url-status');

  if (urlInput) urlInput.value = '';
  // Используем перевод напрямую — эмодзи уже встроен в t('bindUrl')
  if (bindBtn) bindBtn.textContent = t('bindUrl');
  if (unbindBtn) unbindBtn.style.display = 'none';
  if (status) { status.textContent = t('urlUnbound'); status.className = 'modal-status success'; }

  renderInstalledApps();
  renderAllApps();
}

// ==========================================
// ЭКСПОРТ ССЫЛОК
// ==========================================

function getExportableApps() {
  return installedModules
    .map(id => allModules.find(m => m.id === id))
    .filter(m => m && getAppUrl(m.id))
    .map(m => ({
      icon: m.icon,
      name: m.name,
      description: m.description || '',
      url: getAppUrl(m.id)
    }));
}

function generateExportText(apps) {
  if (apps.length === 0) return '';
  return apps.map(app => {
    const lines = [`${app.icon} ${app.name}`];
    if (app.description) lines.push(app.description);
    lines.push(`🔗 ${app.url}`);
    return lines.join('\n');
  }).join('\n\n');
}

function openExportUrlsModal() {
  const modal = document.getElementById('export-urls-modal');
  const textarea = document.getElementById('export-urls-text');
  const emptyMsg = document.getElementById('export-urls-empty');
  const status = document.getElementById('export-urls-status');

  if (!modal) {
    console.error('❌ export-urls-modal not found');
    return;
  }

  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  const apps = getExportableApps();

  if (apps.length === 0) {
    if (textarea) textarea.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
  } else {
    if (textarea) {
      textarea.style.display = 'block';
      textarea.value = generateExportText(apps);
    }
    if (emptyMsg) emptyMsg.style.display = 'none';
  }

  modal.classList.add('active');
}

function closeExportUrlsModal() {
  const modal = document.getElementById('export-urls-modal');
  if (modal) modal.classList.remove('active');
}

function copyExportText() {
  const textarea = document.getElementById('export-urls-text');
  const status = document.getElementById('export-urls-status');

  if (!textarea || !textarea.value) {
    if (status) { status.textContent = t('nothingToCopy'); status.className = 'modal-status error'; }
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textarea.value).then(() => {
      if (status) { status.textContent = t('listCopied'); status.className = 'modal-status success'; }
    }).catch(() => {
      fallbackCopy(textarea.value, status);
    });
  } else {
    fallbackCopy(textarea.value, status);
  }
}