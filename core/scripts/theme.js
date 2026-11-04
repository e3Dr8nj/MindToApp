// ==========================================
// СИСТЕМНЫЕ ТЕМЫ ОФОРМЛЕНИЯ
// ==========================================

const AVAILABLE_THEMES = ['light', 'cyberpunk', 'discord'];

function initTheme() {
  console.log('🎨 [initTheme] Загрузка темы при старте');
  
  const savedTheme = localStorage.getItem('currentTheme');
  console.log('💾 [initTheme] Сохранённая тема:', savedTheme);
  
  if (savedTheme) {
    console.log('🔄 [initTheme] Применяю сохранённую тему:', savedTheme);
    applyTheme(savedTheme);
  } else {
    console.log('🔵 [initTheme] Нет сохранённой темы, применяю light');
    applyTheme('light');
  }
}

function setTheme(themeName) {
  console.log('🎨 [setTheme] Установка темы:', themeName);
  
  // Удаляем все системные темы
  AVAILABLE_THEMES.forEach(theme => {
    const link = document.querySelector(`link[data-theme="${theme}"]`);
    if (link) {
      link.disabled = true;
      console.log('🔴 [setTheme] Отключена тема:', theme);
    }
  });
  
  // Активируем выбранную тему
  if (AVAILABLE_THEMES.includes(themeName)) {
    const link = document.querySelector(`link[data-theme="${themeName}"]`);
    if (link) {
      link.disabled = false;
      console.log('🟢 [setTheme] Активирована тема:', themeName);
    } else {
      console.error('❌ [setTheme] Ссылка на тему не найдена:', themeName);
    }
  } else {
    console.error('❌ [setTheme] Неизвестная тема:', themeName);
  }
  
  // Сохраняем выбор
  localStorage.setItem('currentTheme', themeName);
  console.log('💾 [setTheme] Тема сохранена в localStorage');
}

function getCurrentTheme() {
  return localStorage.getItem('currentTheme') || 'light';
}