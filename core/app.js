// Конфигурация
const REGISTRY_URL = 'https://e3dr8nj.github.io/NexusAl/registry/registry.json';

// Состояние приложения
let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');
let customModules = JSON.parse(localStorage.getItem('customModules') || '[]');

// DOM элементы
const homeScreen = document.getElementById('home-screen');
const storeScreen = document.getElementById('store-screen');
const appScreen = document.getElementById('app-screen');
const installedAppsContainer = document.getElementById('installed-apps');
const allAppsContainer = document.getElementById('all-apps');
const emptyState = document.getElementById('empty-state');
const currentAppName = document.getElementById('current-app-name');
const appFrame = document.getElementById('app-frame');
const addModal = document.getElementById('add-modal');
const moduleUrlInput = document.getElementById('module-url-input');
const modalStatus = document.getElementById('modal-status');

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
    const registryModules = await Promise.all(
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
              url: module.url,
              isCustom: false
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
    const validRegistryModules = registryModules.filter(m => m !== null);
    
    // Объединяем с пользовательскими модулями
    allModules = [...validRegistryModules, ...customModules];
    
    console.log('Успешно загружено модулей:', allModules.length);
    
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    allModules = [...customModules];
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
    // Карточка в магазине
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
    
    // Если это пользовательский модуль, добавляем кнопку удаления
    if (module.isCustom) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.title = 'Удалить модуль';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomModule(module.id);
      });
      card.appendChild(deleteBtn);
    }
  } else {
    // Карточка на рабочем столе — клик открывает приложение
    card.addEventListener('click', () => openApp(module));
    
    // Если это пользовательский модуль, добавляем кнопку удаления
    if (module.isCustom) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.title = 'Удалить модуль';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomModule(module.id);
      });
      card.appendChild(deleteBtn);
    }
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

// Удаление пользовательского модуля
function removeCustomModule(moduleId) {
  if (!confirm('Удалить этот модуль?')) return;
  
  customModules = customModules.filter(m => m.id !== moduleId);
  installedModules = installedModules.filter(id => id !== moduleId);
  
  localStorage.setItem('customModules', JSON.stringify(customModules));
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  
  // Перезагружаем модули
  allModules = allModules.filter(m => m.id !== moduleId);
  
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

// Открытие модального окна
function openAddModal() {
  addModal.classList.add('active');
  moduleUrlInput.value = '';
  modalStatus.textContent = '';
  modalStatus.className = 'modal-status';
  moduleUrlInput.focus();
}

// Закрытие модального окна
function closeAddModal() {
  addModal.classList.remove('active');
  moduleUrlInput.value = '';
  modalStatus.textContent = '';
  modalStatus.className = 'modal-status';
}

// Добавление модуля по URL
async function addModuleByUrl() {
  let url = moduleUrlInput.value.trim();
  
  if (!url) {
    modalStatus.textContent = '❌ Введите URL';
    modalStatus.className = 'modal-status error';
    return;
  }
  
  // Добавляем https:// если нет протокола
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Добавляем / в конец если это не файл
  if (!url.endsWith('/') && !url.endsWith('.html')) {
    url += '/';
  }
  
  modalStatus.textContent = '⏳ Загрузка модуля...';
  modalStatus.className = 'modal-status loading';
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) {
      throw new Error('Manifest не найден в модуле');
    }
    
    const manifest = JSON.parse(manifestScript.textContent);
    
    // Проверяем обязательные поля
    if (!manifest.id || !manifest.name || !manifest.icon) {
      throw new Error('Не все обязательные поля в manifest');
    }
    
    // Проверяем, нет ли уже такого модуля
    if (allModules.some(m => m.id === manifest.id)) {
      throw new Error('Модуль с таким ID уже добавлен');
    }
    
    // Добавляем модуль
    const newModule = {
      ...manifest,
      description: manifest.description || 'Пользовательский модуль',
      url: url,
      isCustom: true
    };
    
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    
    // Автоматически устанавливаем модуль
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    
    // Добавляем в общий список
    allModules.push(newModule);
    
    modalStatus.textContent = '✅ Модуль "' + manifest.name + '" добавлен!';
    modalStatus.className = 'modal-status success';
    
    setTimeout(() => {
      closeAddModal();
      renderInstalledApps();
      renderAllApps();
    }, 1000);
    
  } catch (error) {
    console.error('Ошибка добавления модуля:', error);
    modalStatus.textContent = `❌ Ошибка: ${error.message}`;
    modalStatus.className = 'modal-status error';
  }
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
  
  // Кнопки "Добавить"
  document.getElementById('add-custom-btn').addEventListener('click', openAddModal);
  document.getElementById('add-custom-btn-store').addEventListener('click', openAddModal);
  
  // Модальное окно
  document.getElementById('close-modal-btn').addEventListener('click', closeAddModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeAddModal);
  document.getElementById('confirm-add-btn').addEventListener('click', addModuleByUrl);
  
  // Закрытие по клику вне модалки
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
      closeAddModal();
    }
  });
  
  // Добавление по Enter
  moduleUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addModuleByUrl();
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addModal.classList.contains('active')) {
      closeAddModal();
    }
  });
}

// Запуск
init();