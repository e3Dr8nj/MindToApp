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
    if (module) installedAppsContainer.appendChild(createAppCard(module, true));
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';
  
  // Фильтруем: показываем только стандартные модули (без isCustom)
  const standardModules = allModules.filter(m => !m.isCustom);
  
  if (standardModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Склад пуст</p>';
    return;
  }
  
  standardModules.forEach(module => {
    // Проверяем, установлен ли этот модуль
    const isInstalled = installedModules.includes(module.id);
    allAppsContainer.appendChild(createAppCard(module, isInstalled));
  });
}

function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';
  
  // Добавляем класс для установленных приложений
  if (isInstalled) {
    card.classList.add('app-card-installed');
  }

  // Иконка приложения
  const icon = document.createElement('div');
  icon.className = 'app-card-icon';
  icon.textContent = module.icon;
  icon.title = module.name;

  // Название
  const name = document.createElement('div');
  name.className = 'app-card-name';
  name.textContent = module.name;
  name.title = module.name;

  card.appendChild(icon);
  card.appendChild(name);

  // Badge "Установлено" для склада
  if (isInstalled && !installedAppsContainer.contains(card)) {
    const badge = document.createElement('div');
    badge.className = 'app-card-badge';
    badge.textContent = '✓';
    badge.title = 'Установлено';
    card.appendChild(badge);
  }

  // Кнопки действий под карточкой
  const actions = document.createElement('div');
  actions.className = 'app-card-actions';

  if (isInstalled) {
    // Кнопка "Редактировать" (копирует промпт + инструкцию)
    if (module.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'app-card-action-btn';
      editBtn.textContent = '✏️';
      editBtn.title = 'Редактировать (копировать промпт)';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyCodeWithInstruction(module, editBtn);
      });
      actions.appendChild(editBtn);
    }

    // Кнопка "Поделиться"
    if (module.content) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'app-card-action-btn';
      shareBtn.textContent = '📤';
      shareBtn.title = 'Поделиться';
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openShareModal(module);
      });
      actions.appendChild(shareBtn);
    }

    // Кнопка "Удалить"
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'app-card-action-btn app-card-action-delete';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (module.isCustom) {
        removeCustomModule(module.id);
      } else {
        toggleInstall(module.id);
      }
    });
    actions.appendChild(deleteBtn);

    // Клик по карточке — открыть приложение
    card.addEventListener('click', () => openApp(module));

  } else {
    // Для неустановленных (в Складе)
    
    // Кнопка "Установить"
    const installBtn = document.createElement('button');
    installBtn.className = 'app-card-action-btn app-card-action-install';
    installBtn.textContent = '✅';
    installBtn.title = 'Установить';
    installBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInstall(module.id);
    });
    actions.appendChild(installBtn);

    // Кнопка "Редактировать" (копирует промпт + инструкцию)
    if (module.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'app-card-action-btn';
      editBtn.textContent = '✏️';
      editBtn.title = 'Редактировать (копировать промпт)';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyCodeWithInstruction(module, editBtn);
      });
      actions.appendChild(editBtn);
    }

    // Кнопка "Поделиться"
    if (module.content) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'app-card-action-btn';
      shareBtn.textContent = '📤';
      shareBtn.title = 'Поделиться';
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openShareModal(module);
      });
      actions.appendChild(shareBtn);
    }

    // Клик по карточке — показать информацию
    card.addEventListener('click', () => openAppInfoModal(module, isInstalled));
  }

  card.appendChild(actions);
  return card;
}

function showScreen(screen) {
  const homeScreenEl = document.getElementById('home-screen');
  const storeScreenEl = document.getElementById('store-screen');
  const appScreenEl = document.getElementById('app-screen');
  const clipboardScreenEl = document.getElementById('clipboard-screen');
  
  [homeScreenEl, storeScreenEl, appScreenEl, clipboardScreenEl].forEach(s => {
    if (s) s.classList.remove('active');
  });
  
  if (screen) screen.classList.add('active');
}