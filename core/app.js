// Конфигурация
const REGISTRY_URL = '../registry/registry.json'; // Путь к реестру

// Состояние приложения
let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');

// DOM элементы
const homeScreen = document.getElementById('home-screen');
const storeScreen = document.getElementById('store-screen');
const appScreen = document.getElementById('app-screen');
const installedAppsContainer = document.getElementById('installed-apps');
const allAppsContainer = document.getElementById('all-apps');
const emptyState = document.getElementById('empty-state');
const currentAppName = document.getElementById('current-app-name');
const appFrame = document.getElementById('app-frame');

// Инициализация
async function init() {
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
}

// Загрузка реестра модулей
async function loadRegistry() {
  try {
    const response = await fetch(REGISTRY_URL);
    const data = await response.json();
    allModules = data.modules;
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    allModules = [];
  }
}

// Отрисовка установленных приложений
function renderInstalledApps() {
  installedAppsContainer.innerHTML = '';
  
  if (installedModules.length === 0) {
    emptyState.style.display = 'block';
    installedAppsContainer.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  installedAppsContainer.style.display = 'grid';
  
  installedModules.forEach(moduleId => {
    const module = allModules.find(m => m.id === moduleId);
    if (module) {
      const card = createAppCard(module, true);
      installedAppsContainer.appendChild(card);
    }
  });
}

// Отрисовка всех приложений в магазине
function renderAllApps() {
  allAppsContainer.innerHTML = '';
  
  allModules.forEach(module => {
    const card = createAppCard(module, false);
    allAppsContainer.appendChild(card);
  });
}

// Создание карточки приложения
function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';
  
  const icon = document.createElement('div');
  icon.className = 'app-icon';
  icon.textContent = module.icon;
  
  const name = document.createElement('div');
  name.className = 'app-name';
  name.textContent = module.name;
  
  const description = document.createElement('div');
  description.className = 'app-description';
  description.textContent = module.description;
  
  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(description);
  
  if (!isInstalled) {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.textContent = installedModules.includes(module.id) ? 'Удалить' : 'Установить';
    
    if (installedModules.includes(module.id)) {
      installBtn.classList.add('installed');
    }
    
    installBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInstall(module.id);
    });
    
    card.appendChild(installBtn);
  } else {
    card.addEventListener('click', () => openApp(module));
  }
  
  return card;
}

// Установка/удаление модуля
function toggleInstall(moduleId) {
  const index = installedModules.indexOf(moduleId);
  
  if (index > -1) {
    installedModules.splice(index, 1);
  } else {
    installedModules.push(moduleId);
  }
  
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

// Открытие приложения
function openApp(module) {
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
}

// Закрытие приложения
function closeApp() {
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
}

// Переключение экранов
function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Настройка обработчиков событий
function setupEventListeners() {
  document.getElementById('open-store-btn').addEventListener('click', () => {
    renderAllApps();
    showScreen(storeScreen);
  });
  
  document.getElementById('back-to-home-btn').addEventListener('click', () => {
    showScreen(homeScreen);
  });
  
  document.getElementById('go-to-store-btn').addEventListener('click', () => {
    renderAllApps();
    showScreen(storeScreen);
  });
  
  document.getElementById('close-app-btn').addEventListener('click', closeApp);
}

// Запуск
init();