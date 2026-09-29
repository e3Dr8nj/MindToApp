// Конфигурация
const REGISTRY_URL = 'https://e3dr8nj.github.io/NexusAl/registry/registry.json';

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
  console.log('Инициализация приложения...');
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  console.log('Приложение готово. Загружено модулей:', allModules.length);
}

// Загрузка реестра модулей
async function loadRegistry() {
  try {
    console.log('Загрузка реестра из:', REGISTRY_URL);
    const response = await fetch(REGISTRY_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Реестр загружен:', data);
    
    // Для каждого модуля загружаем HTML и парсим manifest
    allModules = await Promise.all(
      data.modules.map(async (module) => {
        try {
          console.log('Загрузка модуля:', module.url);
          const htmlResponse = await fetch(module.url);
          
          if (!htmlResponse.ok) {
            throw new Error(`HTTP error! status: ${htmlResponse.status}`);
          }
          
          const htmlText = await htmlResponse.text();
          
          // Парсим manifest из HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          const manifestScript = doc.getElementById('manifest');
          
          if (manifestScript) {
            const manifest = JSON.parse(manifestScript.textContent);
            console.log('Manifest найден:', manifest);
            return {
              ...manifest,
              url: module.url
            };
          } else {
            console.warn('Manifest не найден в модуле:', module.url);
          }
        } catch (error) {
          console.error('Ошибка загрузки модуля:', module.url, error);
        }
        return null;
      })
    );
    
    // Фильтруем модули, которые не загрузились
    allModules = allModules.filter(m => m !== null);
    
    console.log('Успешно загружено модулей:', allModules.length);
    
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    allModules = [];
  }
}

// Отрисовка установленных приложений
function renderInstalledApps() {
  console.log('Отрисовка установленных приложений:', installedModules);
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
    } else {
      console.warn('Модуль не найден в реестре:', moduleId);
    }
  });
}

// Отрисовка всех приложений в магазине
function renderAllApps() {
  console.log('Отрисовка всех приложений в магазине');
  allAppsContainer.innerHTML = '';
  
  if (allModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Нет доступных модулей</p>';
    return;
  }
  
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
  console.log('Переключение установки модуля:', moduleId);
  const index = installedModules.indexOf(moduleId);
  
  if (index > -1) {
    installedModules.splice(index, 1);
    console.log('Модуль удален');
  } else {
    installedModules.push(moduleId);
    console.log('Модуль установлен');
  }
  
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

// Открытие приложения
function openApp(module) {
  console.log('Открытие приложения:', module.name, module.url);
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
}

// Закрытие приложения
function closeApp() {
  console.log('Закрытие приложения');
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
}

// Переключение экранов
function showScreen(screen) {
  console.log('Переключение экрана');
  [homeScreen, storeScreen, appScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Настройка обработчиков событий
function setupEventListeners() {
  console.log('Настройка обработчиков событий');
  
  document.getElementById('open-store-btn').addEventListener('click', () => {
    console.log('Клик: открыть магазин');
    renderAllApps();
    showScreen(storeScreen);
  });
  
  document.getElementById('back-to-home-btn').addEventListener('click', () => {
    console.log('Клик: назад на главную');
    showScreen(homeScreen);
  });
  
  document.getElementById('go-to-store-btn').addEventListener('click', () => {
    console.log('Клик: перейти в магазин');
    renderAllApps();
    showScreen(storeScreen);
  });
  
  document.getElementById('close-app-btn').addEventListener('click', closeApp);
}

// Запуск
init();