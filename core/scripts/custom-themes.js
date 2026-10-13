// ==========================================
// ПОЛЬЗОВАТЕЛЬСКИЕ ТЕМЫ
// ==========================================

// Шаблон темы для ИИ
const THEME_TEMPLATE = `/* ШАБЛОН ТЕМЫ ДЛЯ MindToApp */
/* Отредактируй цвета и верни ПОЛНЫЙ CSS без изменений структуры */

body[data-theme="НАЗВАНИЕ_ТЕМЫ"] {
  --bg-gradient-start: #667eea;
  --bg-gradient-end: #764ba2;
  --text-color: #333;
  --heading-color: white;
  --card-bg: white;
  --card-shadow: rgba(0, 0, 0, 0.1);
  --card-shadow-hover: rgba(0, 0, 0, 0.2);
  --btn-bg: rgba(255, 255, 255, 0.2);
  --btn-hover-bg: rgba(255, 255, 255, 0.3);
  --btn-primary-bg: white;
  --btn-primary-color: #667eea;
  --btn-primary-hover-bg: #f0f0f0;
  --btn-secondary-bg: #e0e0e0;
  --btn-secondary-color: #333;
  --btn-secondary-hover-bg: #d0d0d0;
  --description-color: #666;
  --app-header-bg: white;
  --app-header-shadow: rgba(0, 0, 0, 0.15);
  --app-header-text: #333;
  --modal-bg: white;
  --modal-shadow: rgba(0, 0, 0, 0.3);
  --modal-heading-color: #333;
  --modal-close-color: #999;
  --modal-close-hover-bg: #f5f5f5;
  --modal-close-hover-color: #333;
  --modal-description-color: #666;
  --input-border: #e0e0e0;
  --input-focus-border: #667eea;
  --code-bg: #1e1e2e;
  --code-text: #cdd6f4;
  --code-input-bg: #f8f9fa;
  --code-input-border: #cbd5e1;
  --code-input-text: #333;
  --tab-bg: #f0f0f0;
  --tab-active-bg: white;
  --tab-active-color: #667eea;
  --tab-color: #666;
  --tab-hover-color: #333;
  --ai-link-bg: #f0f4ff;
  --ai-link-color: #667eea;
  --ai-link-hover-bg: #667eea;
  --ai-link-hover-color: white;
  --ai-link-hover-shadow: rgba(102, 126, 234, 0.3);
  --edit-preview-bg: #f0f4ff;
  --edit-preview-name-color: #333;
  --edit-preview-desc-color: #666;
  --status-error-bg: #fee;
  --status-error-color: #c33;
  --status-success-bg: #efe;
  --status-success-color: #3c3;
  --status-loading-bg: #eef;
  --status-loading-color: #667eea;
  --folder-warning-bg: #fff3cd;
  --folder-warning-color: #856404;
  --accent-color: #667eea;
  --accent-hover: #5568d3;
  --delete-btn-bg: #e74c3c;
  --edit-btn-bg: #667eea;
  --share-btn-bg: #2ecc71;
  --share-btn-hover-bg: #27ae60;
  --btn-back-bg: #667eea;
  --btn-back-hover-bg: #5568d3;
  --btn-back-shadow: rgba(102, 126, 234, 0.3);
  --toast-success-bg: #2ecc71;
  --toast-error-bg: #e74c3c;
  --toast-info-bg: #667eea;
}`;

// Загрузка пользовательских тем из localStorage
function loadCustomThemes() {
  try {
    const stored = localStorage.getItem('customThemes');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Ошибка загрузки тем:', e);
    return [];
  }
}

// Сохранение пользовательских тем
function saveCustomThemes(themes) {
  localStorage.setItem('customThemes', JSON.stringify(themes));
}

// Применение всех пользовательских тем (при загрузке)
function applyAllCustomThemes() {
  const themes = loadCustomThemes();
  
  // Удаляем все старые стили
  const oldStyles = document.querySelectorAll('[id^="custom-theme-"]');
  oldStyles.forEach(s => s.remove());
  
  // Создаём один общий стиль
  if (themes.length > 0) {
    const style = document.createElement('style');
    style.id = 'custom-themes-style';
    
    let css = '';
    themes.forEach(theme => {
      css += `body[data-theme="${theme.id}"] {\n`;
      for (const [key, value] of Object.entries(theme.variables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += `}\n`;
    });
    
    style.textContent = css;
    document.head.appendChild(style);
  }
}

// Парсинг CSS темы
function parseThemeCSS(css, themeName) {
  const variables = {};
  
  // Извлекаем блок body[data-theme="..."]
  const match = css.match(/body\[data-theme="([^"]+)"\]\s*\{([^}]+)\}/);
  if (!match) {
    throw new Error('Не найден блок body[data-theme="..."]');
  }
  
  const themeId = match[1];
  const variablesBlock = match[2];
  
  // Парсим переменные
  const varMatches = variablesBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g);
  for (const varMatch of varMatches) {
    variables[varMatch[1]] = varMatch[2].trim();
  }
  
  if (Object.keys(variables).length === 0) {
    throw new Error('Не найдены CSS-переменные');
  }
  
  return {
    id: themeId,
    name: themeName || themeId,
    variables
  };
}

// Добавление новой темы
function addCustomTheme(css, themeName) {
  try {
    const theme = parseThemeCSS(css, themeName);
    
    // Проверяем, не существует ли уже
    const themes = loadCustomThemes();
    const existingIndex = themes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      // Обновляем существующую
      themes[existingIndex] = theme;
    } else {
      // Добавляем новую
      themes.push(theme);
    }
    
    saveCustomThemes(themes);
    applyAllCustomThemes();
    
    // Добавляем в список тем
    THEMES[theme.id] = {
      name: theme.name,
      icon: '🎨',
      isCustom: true
    };
    
    return theme;
  } catch (error) {
    throw error;
  }
}

// Удаление темы
function deleteCustomTheme(themeId) {
  if (!confirm(`Удалить тему "${themeId}"?`)) return;
  
  const themes = loadCustomThemes();
  const filtered = themes.filter(t => t.id !== themeId);
  saveCustomThemes(filtered);
  
  // Удаляем из списка тем
  delete THEMES[themeId];
  
  // Если текущая тема удалена, переключаемся на light
  if (currentTheme === themeId) {
    applyTheme('light');
  }
  
  // Перерисовываем список тем
  applyAllCustomThemes();
  renderCustomThemesList();
}

// Отрисовка списка пользовательских тем
function renderCustomThemesList() {
  const container = $('custom-themes-list');
  if (!container) return;
  
  const themes = loadCustomThemes();
  
  if (themes.length === 0) {
    container.innerHTML = '<p style="color: var(--description-color); text-align: center; padding: 20px;">Нет пользовательских тем</p>';
    return;
  }
  
  container.innerHTML = themes.map(theme => `
    <div class="custom-theme-item">
      <div class="custom-theme-info">
        <span class="custom-theme-name">🎨 ${theme.name}</span>
        <button class="btn btn-small" onclick="applyTheme('${theme.id}')">Применить</button>
      </div>
      <button class="delete-theme-btn" onclick="deleteCustomTheme('${theme.id}')" title="Удалить">×</button>
    </div>
  `).join('');
}

// Открытие модалки добавления темы
function openAddThemeModal() {
  const modal = $('add-theme-modal');
  if (modal) {
    modal.classList.add('active');
    
    // Очищаем поля
    const nameInput = $('theme-name-input');
    const cssInput = $('theme-css-input');
    const status = $('add-theme-status');
    
    if (nameInput) nameInput.value = '';
    if (cssInput) cssInput.value = '';
    if (status) {
      status.textContent = '';
      status.className = 'modal-status';
    }
  }
}

// Закрытие модалки
function closeAddThemeModal() {
  const modal = $('add-theme-modal');
  if (modal) modal.classList.remove('active');
}

// Копирование шаблона темы
function copyThemeTemplate() {
  const templateBtn = $('copy-theme-template-btn');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(THEME_TEMPLATE).then(() => {
      if (templateBtn) {
        templateBtn.textContent = '✅ Скопировано!';
        setTimeout(() => templateBtn.textContent = '📋 Скопировать шаблон', 2000);
      }
    }).catch(err => {
      console.error('Ошибка копирования:', err);
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = THEME_TEMPLATE;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (templateBtn) {
        templateBtn.textContent = '✅ Скопировано!';
        setTimeout(() => templateBtn.textContent = '📋 Скопировать шаблон', 2000);
      }
    } catch (e) {
      console.error('Ошибка копирования:', e);
    }
    document.body.removeChild(textarea);
  }
}

// Добавление темы из модалки
function submitCustomTheme() {
  const nameInput = $('theme-name-input');
  const cssInput = $('theme-css-input');
  const status = $('add-theme-status');
  
  if (!nameInput || !cssInput) return;
  
  const themeName = nameInput.value.trim();
  const css = cssInput.value.trim();
  
  if (!themeName) {
    if (status) {
      status.textContent = '❌ Введите название темы';
      status.className = 'modal-status error';
    }
    return;
  }
  
  if (!css) {
    if (status) {
      status.textContent = '❌ Вставьте CSS-код темы';
      status.className = 'modal-status error';
    }
    return;
  }
  
  try {
    // Заменяем НАЗВАНИЕ_ТЕМЫ на реальный ID
    const themeId = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 6);
    const processedCSS = css.replace(/НАЗВАНИЕ_ТЕМЫ/g, themeId);
    
    const theme = addCustomTheme(processedCSS, themeName);
    
    if (status) {
      status.textContent = `✅ Тема "${theme.name}" добавлена!`;
      status.className = 'modal-status success';
    }
    
    // Закрываем модалку через 1.5 секунды
    setTimeout(() => {
      closeAddThemeModal();
      renderCustomThemesList();
    }, 1500);
    
  } catch (error) {
    if (status) {
      status.textContent = `❌ Ошибка: ${error.message}`;
      status.className = 'modal-status error';
    }
  }
}

// Инициализация пользовательских тем при загрузке
function initCustomThemes() {
  const themes = loadCustomThemes();
  
  // Добавляем в список THEMES
  themes.forEach(theme => {
    THEMES[theme.id] = {
      name: theme.name,
      icon: '🎨',
      isCustom: true
    };
  });
  
  // Применяем все темы
  applyAllCustomThemes();
  
  console.log(`🎨 Загружено пользовательских тем: ${themes.length}`);
}