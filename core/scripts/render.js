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
  if (allModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Нет доступных модулей</p>';
    return;
  }
  allModules.forEach(module => allAppsContainer.appendChild(createAppCard(module, false)));
}

function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';

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

  // Кнопки действий под карточкой
  const actions = document.createElement('div');
  actions.className = 'app-card-actions';

  if (isInstalled) {
    // Кнопка "Открыть"
    const openBtn = document.createElement('button');
    openBtn.className = 'app-card-action-btn';
    openBtn.textContent = '🚀';
    openBtn.title = 'Открыть';
    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openApp(module);
    });
    actions.appendChild(openBtn);

    // Кнопка "Редактировать" (только если есть код)
    if (module.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'app-card-action-btn';
      editBtn.textContent = '✏️';
      editBtn.title = 'Редактировать';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(module);
      });
      actions.appendChild(editBtn);
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

    // Кнопка "Информация"
    const infoBtn = document.createElement('button');
    infoBtn.className = 'app-card-action-btn';
    infoBtn.textContent = 'ℹ️';
    infoBtn.title = 'Подробнее';
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAppInfoModal(module, isInstalled);
    });
    actions.appendChild(infoBtn);

    // Клик по карточке — показать информацию
    card.addEventListener('click', () => openAppInfoModal(module, isInstalled));
  }

  card.appendChild(actions);
  return card;
}

function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => {
    if (s) s.classList.remove('active');
  });
  if (screen) screen.classList.add('active');
}