// ==========================================
// СИСТЕМА ТЕМ
// ==========================================

const THEMES = {
  light: {
    name: 'Светлая',
    icon: '☀️'
  },
  cyberpunk: {
    name: 'Киберпанк',
    icon: '🌆'
  },
  discord: {
    name: 'Дискорд',
    icon: '💬'
  }
};

let currentTheme = localStorage.getItem('mindtoapp_theme') || 'light';

// Применение темы
function applyTheme(themeName) {
  if (!THEMES[themeName]) {
    console.error('Неизвестная тема:', themeName);
    return;
  }
  
  // Проверяем, что document.body доступен
  if (!document.body) {
    console.warn('document.body ещё не доступен, ждём загрузки DOM');
    setTimeout(() => applyTheme(themeName), 100);
    return;
  }
  
  currentTheme = themeName;
  
  // Устанавливаем атрибут data-theme
  document.body.setAttribute('data-theme', themeName);
  
  // Сохраняем в localStorage
  localStorage.setItem('mindtoapp_theme', themeName);
  
  // Обновляем кнопку переключения темы
  updateThemeButton();
  
  console.log(`✅ Тема применена: ${themeName}`);
}

// Переключение на следующую тему
function cycleTheme() {
  const themeKeys = Object.keys(THEMES);
  const currentIndex = themeKeys.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeKeys.length;
  const nextTheme = themeKeys[nextIndex];
  
  console.log(`🔄 Переключение темы: ${currentTheme} → ${nextTheme}`);
  applyTheme(nextTheme);
}

// Обновление текста кнопки темы
function updateThemeButton() {
  const themeBtn = $('theme-toggle-btn');
  if (themeBtn) {
    const theme = THEMES[currentTheme];
    themeBtn.textContent = `${theme.icon} ${theme.name}`;
    themeBtn.title = `Текущая тема: ${theme.name}. Нажмите для переключения.`;
  }
}

// Инициализация темы при загрузке
function initTheme() {
  console.log(`🎨 Инициализация темы: ${currentTheme}`);
  applyTheme(currentTheme);
}