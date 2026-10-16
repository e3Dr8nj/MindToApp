// ==========================================
// ПОЛЬЗОВАТЕЛЬСКИЕ ТЕМЫ
// ==========================================

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
  
  const oldStyles = document.querySelectorAll('[id^="custom-theme-"]');
  oldStyles.forEach(s => s.remove());
  
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
  
  const match = css.match(/body\[data-theme="([^"]+)"\]\s*\{([^}]+)\}/);
  if (!match) {
    throw new Error('Не найден блок body[data-theme="..."]');
  }
  
  const themeId = match[1];
  const variablesBlock = match[2];
  
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
    
    const themes = loadCustomThemes();
    const existingIndex = themes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      themes[existingIndex] = theme;
    } else {
      themes.push(theme);
    }
    
    saveCustomThemes(themes);
    applyAllCustomThemes();
    
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
  
  delete THEMES[themeId];
  
  if (currentTheme === themeId) {
    applyTheme('light');
  }
  
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
  
  // Используем getPrompt() из prompts.js
  const template = getPrompt('THEME_TEMPLATE');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(template).then(() => {
      if (templateBtn) {
        templateBtn.textContent = '✅ Скопировано!';
        setTimeout(() => templateBtn.textContent = '📋 Скопировать шаблон', 2000);
      }
    }).catch(err => {
      console.error('Ошибка копирования:', err);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = template;
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
    const themeId = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 6);
    const processedCSS = css.replace(/НАЗВАНИЕ_ТЕМЫ/g, themeId);
    
    const theme = addCustomTheme(processedCSS, themeName);
    
    if (status) {
      status.textContent = `✅ Тема "${theme.name}" добавлена!`;
      status.className = 'modal-status success';
    }
    
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
  
  themes.forEach(theme => {
    THEMES[theme.id] = {
      name: theme.name,
      icon: '🎨',
      isCustom: true
    };
  });
  
  applyAllCustomThemes();
  
  console.log(`🎨 Загружено пользовательских тем: ${themes.length}`);
}