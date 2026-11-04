const AVAILABLE_THEMES = ['light', 'cyberpunk', 'discord'];

function initTheme() {
  const savedTheme = localStorage.getItem('currentTheme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme('light');
  }
}

function setTheme(themeName) {
  AVAILABLE_THEMES.forEach(theme => {
    const link = document.querySelector(`link[data-theme="${theme}"]`);
    if (link) {
      link.disabled = true;
    }
  });
  
  if (AVAILABLE_THEMES.includes(themeName)) {
    const link = document.querySelector(`link[data-theme="${themeName}"]`);
    if (link) {
      link.disabled = false;
    }
  }
  
  localStorage.setItem('currentTheme', themeName);
}

function getCurrentTheme() {
  return localStorage.getItem('currentTheme') || 'light';
}