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
    console.error('Ошибка загрузки appUrls:', e);
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

  // Заполняем превью
  const iconEl = document.getElementById('share-preview-icon');
  const nameEl = document.getElementById('share-preview-name');
  const descEl = document.getElementById('share-preview-desc');
  if (iconEl) iconEl.textContent = module.icon;
  if (nameEl) nameEl.textContent = module.name;
  if (descEl) descEl.textContent = module.description || 'Нет описания';

  // Очищаем статус копирования кода
  const status = document.getElementById('copy-code-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  // Шаг 3: привязка ссылки
  const urlInput = document.getElementById('share-url-input');
  const bindBtn = document.getElementById('bind-url-btn');
  const unbindBtn = document.getElementById('unbind-url-btn');
  const urlStatus = document.getElementById('share-url-status');

  if (urlInput && bindBtn && unbindBtn) {
    const existingUrl = getAppUrl(module.id);

    if (existingUrl) {
      // Ссылка уже привязана — показываем её
      urlInput.value = existingUrl;
      bindBtn.textContent = '✏️ Изменить ссылку';
      unbindBtn.style.display = 'inline-block';
    } else {
      // Ссылка не привязана — поле пустое (без автозаполнения из буфера)
      urlInput.value = '';
      bindBtn.textContent = '🔗 Привязать ссылку';
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
    if (status) { status.textContent = '❌ У приложения нет кода'; status.className = 'modal-status error'; }
    return;
  }

  const status = document.getElementById('copy-code-status');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentShareModule.content).then(() => {
      if (status) { status.textContent = '✅ Код скопирован в буфер обмена!'; status.className = 'modal-status success'; }
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
    if (statusEl) { statusEl.textContent = '✅ Код скопирован в буфер обмена!'; statusEl.className = 'modal-status success'; }
  } catch (e) {
    if (statusEl) { statusEl.textContent = '❌ Не удалось скопировать'; statusEl.className = 'modal-status error'; }
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
    if (status) { status.textContent = '❌ Введите ссылку'; status.className = 'modal-status error'; }
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (status) { status.textContent = '❌ Ссылка должна начинаться с https://'; status.className = 'modal-status error'; }
    return;
  }

  setAppUrl(currentShareModule.id, url);

  if (status) { status.textContent = '✅ Ссылка привязана к приложению!'; status.className = 'modal-status success'; }
  if (bindBtn) bindBtn.textContent = '✏️ Изменить ссылку';
  if (unbindBtn) unbindBtn.style.display = 'inline-block';

  // Обновляем карточки (чтобы значок 🔗 появился)
  renderInstalledApps();
  renderAllApps();
}

function unbindUrlFromApp() {
  if (!currentShareModule) return;

  if (!confirm('Отвязать ссылку от этого приложения?')) return;

  removeAppUrl(currentShareModule.id);

  const urlInput = document.getElementById('share-url-input');
  const bindBtn = document.getElementById('bind-url-btn');
  const unbindBtn = document.getElementById('unbind-url-btn');
  const status = document.getElementById('share-url-status');

  if (urlInput) urlInput.value = '';
  if (bindBtn) bindBtn.textContent = '🔗 Привязать ссылку';
  if (unbindBtn) unbindBtn.style.display = 'none';
  if (status) { status.textContent = '✅ Ссылка отвязана'; status.className = 'modal-status success'; }

  // Обновляем карточки
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
    console.error('❌ Модалка export-urls-modal не найдена');
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
    if (status) { status.textContent = '❌ Нечего копировать'; status.className = 'modal-status error'; }
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textarea.value).then(() => {
      if (status) { status.textContent = '✅ Список скопирован в буфер обмена!'; status.className = 'modal-status success'; }
    }).catch(() => {
      fallbackCopy(textarea.value, status);
    });
  } else {
    fallbackCopy(textarea.value, status);
  }
}