// ==========================================
// ПОЛЬЗОВАТЕЛЬСКИЕ ТЕМЫ ОФОРМЛЕНИЯ
// ==========================================

const DEFAULT_CUSTOM_THEMES = [];

function initCustomThemes() {
  const stored = localStorage.getItem('customThemes');
  if (!stored) {
    localStorage.setItem('customThemes', JSON.stringify(DEFAULT_CUSTOM_THEMES));
  }
}

function getCustomThemes() {
  const stored = localStorage.getItem('customThemes');
  return stored ? JSON.parse(stored) : DEFAULT_CUSTOM_THEMES;
}

function saveCustomThemes(themes) {
  localStorage.setItem('customThemes', JSON.stringify(themes));
}

function addCustomTheme(name, css) {
  const themes = getCustomThemes();
  const id = 'custom-' + Date.now();
  themes.push({ id, name, css });
  saveCustomThemes(themes);
  return id;
}

function removeCustomTheme(id) {
  let themes = getCustomThemes();
  themes = themes.filter(t => t.id !== id);
  saveCustomThemes(themes);
}

function renderCustomThemesList() {
  const list = document.getElementById('custom-themes-list');
  if (!list) return;

  list.innerHTML = '';
  const themes = getCustomThemes();

  if (themes.length === 0) {
    list.innerHTML = '<div style="color: var(--description-color); font-size: 13px; padding: 10px; text-align: center;">No custom themes yet</div>';
    return;
  }

  themes.forEach(theme => {
    const item = document.createElement('div');
    item.className = 'custom-theme-item';
    item.innerHTML = `
      <div class="custom-theme-info">
        <span class="custom-theme-name">${escapeHtml(theme.name)}</span>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-small" onclick="applyTheme('${theme.id}')">Apply</button>
        <button class="delete-theme-btn" onclick="deleteCustomTheme('${theme.id}')" title="Delete">×</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function deleteCustomTheme(id) {
  if (!confirm('Delete this theme?')) return;
  removeCustomTheme(id);
  renderCustomThemesList();
}

// ==========================================
// ШАБЛОН ТЕМЫ ДЛЯ КОПИРОВАНИЯ
// ==========================================

function getThemeTemplate() {
  return `/* ==========================================
   CUSTOM THEME TEMPLATE
   ==========================================
   Скопируйте этот шаблон, отправьте в нейросеть
   и попросите изменить цвета на желаемые.
   Все переменные ниже обязательны.
   ========================================== */

:root {
  /* === Основные цвета === */
  --bg-gradient-start: #1a1a2e;
  --bg-gradient-end: #16213e;
  --text-color: #e0e0e0;
  --heading-color: #ffffff;
  --description-color: #a0a0a0;

  /* === Карточки === */
  --card-bg: #1e1e2f;
  --card-shadow: rgba(0, 0, 0, 0.3);
  --card-shadow-hover: rgba(0, 0, 0, 0.5);

  /* === Кнопки (общие) === */
  --btn-bg: #2a2a3e;
  --btn-hover-bg: #3a3a4e;

  /* === Основные кнопки === */
  --btn-primary-bg: #667eea;
  --btn-primary-color: #ffffff;
  --btn-primary-hover-bg: #5568d3;

  /* === Вторичные кнопки === */
  --btn-secondary-bg: #3a3a4e;
  --btn-secondary-color: #e0e0e0;
  --btn-secondary-hover-bg: #4a4a5e;

  /* === Кнопка "Назад" === */
  --btn-back-bg: #667eea;
  --btn-back-hover-bg: #5568d3;
  --btn-back-shadow: rgba(102, 126, 234, 0.3);

  /* === Кнопка "Удалить" === */
  --delete-btn-bg: #e74c3c;

  /* === Кнопка "Поделиться" / "Установить" === */
  --share-btn-bg: #2ecc71;
  --share-btn-hover-bg: #27ae60;

  /* === Акцентный цвет (основной) === */
  --accent-color: #667eea;
  --accent-hover: #5568d3;

  /* === Поля ввода === */
  --input-border: #3a3a4e;
  --input-focus-border: #667eea;

  /* === Поле кода === */
  --code-input-bg: #0f0f1a;
  --code-input-text: #e0e0e0;
  --code-input-border: #3a3a4e;

  /* === Блок кода (промпт) === */
  --code-bg: #0f0f1a;
  --code-text: #e0e0e0;

  /* === Модалки === */
  --modal-bg: #1e1e2f;
  --modal-shadow: rgba(0, 0, 0, 0.5);
  --modal-heading-color: #ffffff;
  --modal-description-color: #a0a0a0;
  --modal-close-color: #a0a0a0;
  --modal-close-hover-bg: #3a3a4e;
  --modal-close-hover-color: #ffffff;

  /* === Статусы === */
  --status-error-bg: rgba(231, 76, 60, 0.2);
  --status-error-color: #e74c3c;
  --status-success-bg: rgba(46, 204, 113, 0.2);
  --status-success-color: #2ecc71;
  --status-loading-bg: rgba(102, 126, 234, 0.2);
  --status-loading-color: #667eea;

  /* === Вкладки === */
  --tab-bg: #2a2a3e;
  --tab-color: #a0a0a0;
  --tab-active-bg: #667eea;
  --tab-active-color: #ffffff;
  --tab-hover-color: #ffffff;

  /* === Предупреждение о папке === */
  --folder-warning-bg: rgba(241, 196, 15, 0.1);
  --folder-warning-color: #f1c40f;

  /* === Превью (редактирование / шаринг) === */
  --edit-preview-bg: #2a2a3e;
  --edit-preview-name-color: #ffffff;
  --edit-preview-desc-color: #a0a0a0;

  /* === Ссылки на нейросети === */
  --ai-link-bg: #2a2a3e;
  --ai-link-color: #667eea;
  --ai-link-hover-bg: #3a3a4e;
  --ai-link-hover-color: #8899ff;
  --ai-link-hover-shadow: rgba(102, 126, 234, 0.3);

  /* === Хедер приложения === */
  --app-header-bg: #1e1e2f;
  --app-header-text: #ffffff;
  --app-header-shadow: rgba(0, 0, 0, 0.3);

  /* === Toast-уведомления === */
  --toast-info-bg: #667eea;
  --toast-success-bg: #2ecc71;
  --toast-error-bg: #e74c3c;
}`;
}

function copyThemeTemplate() {
  const template = getThemeTemplate();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(template).then(() => {
      showToast('✅ Theme template copied!', 'success');
    }).catch(() => {
      fallbackCopyTheme(template);
    });
  } else {
    fallbackCopyTheme(template);
  }
}

function fallbackCopyTheme(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('✅ Theme template copied!', 'success');
  } catch (e) {
    showToast('❌ Failed to copy', 'error');
  }
  document.body.removeChild(textarea);
}

function submitCustomTheme() {
  const nameInput = document.getElementById('theme-name-input');
  const cssInput = document.getElementById('theme-css-input');
  const status = document.getElementById('add-theme-status');

  if (!nameInput || !cssInput) return;

  const name = nameInput.value.trim();
  const css = cssInput.value.trim();

  if (!name) {
    if (status) { status.textContent = '❌ Enter theme name'; status.className = 'modal-status error'; }
    return;
  }

  if (!css) {
    if (status) { status.textContent = '❌ Paste CSS code'; status.className = 'modal-status error'; }
    return;
  }

  if (!css.includes(':root')) {
    if (status) { status.textContent = '❌ CSS must contain :root block'; status.className = 'modal-status error'; }
    return;
  }

  const id = addCustomTheme(name, css);

  if (status) { status.textContent = '✅ Theme added!'; status.className = 'modal-status success'; }

  setTimeout(() => {
    nameInput.value = '';
    cssInput.value = '';
    if (status) { status.textContent = ''; status.className = 'modal-status'; }
    closeAddThemeModal();
    renderCustomThemesList();
  }, 1000);
}

function openAddThemeModal() {
  const modal = document.getElementById('add-theme-modal');
  const nameInput = document.getElementById('theme-name-input');
  const cssInput = document.getElementById('theme-css-input');
  const status = document.getElementById('add-theme-status');

  if (nameInput) nameInput.value = '';
  if (cssInput) cssInput.value = '';
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  // Заполняем ссылки на нейросети в модалке
  const themeAiLinks = document.getElementById('theme-ai-links');
  if (themeAiLinks) {
    themeAiLinks.innerHTML = '';
    const networks = getAINetworks();
    networks.forEach(network => {
      const link = document.createElement('a');
      link.href = network.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'ai-link';
      link.textContent = network.name;
      themeAiLinks.appendChild(link);
    });
  }

  if (modal) modal.classList.add('active');
}

function closeAddThemeModal() {
  const modal = document.getElementById('add-theme-modal');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// ПРИМЕНЕНИЕ ТЕМЫ
// ==========================================

function applyTheme(themeId) {
  // Удаляем все пользовательские стили тем
  document.querySelectorAll('style[data-custom-theme]').forEach(el => el.remove());

  if (!themeId || themeId === 'light' || themeId === 'cyberpunk' || themeId === 'discord') {
    // Системная тема — переключаем через стандартный механизм
    if (typeof setTheme === 'function') setTheme(themeId || 'light');
    return;
  }

  // Пользовательская тема
  const themes = getCustomThemes();
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;

  const style = document.createElement('style');
  style.setAttribute('data-custom-theme', themeId);
  style.textContent = theme.css;
  document.head.appendChild(style);

  // Сохраняем выбор
  localStorage.setItem('currentTheme', themeId);
}