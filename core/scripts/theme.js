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
  
  currentTheme = themeName;
  document.body.setAttribute('data-theme', themeName);
  localStorage.setItem('mindtoapp_theme', themeName);
  
  // Обновляем кнопку переключения темы
  updateThemeButton();
}

// Переключение на следующую тему
function cycleTheme() {
  const themeKeys = Object.keys(THEMES);
  const currentIndex = themeKeys.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeKeys.length;
  const nextTheme = themeKeys[nextIndex];
  
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
  applyTheme(currentTheme);
}