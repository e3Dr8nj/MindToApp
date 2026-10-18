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

  // Иконка — клик открывает модалку с информацией
  const icon = document.createElement('div');
  icon.className = 'app-card-icon';
  icon.textContent = module.icon;
  icon.title = 'Подробнее';
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    openAppInfoModal(module, isInstalled);
  });

  // Название
  const name = document.createElement('div');
  name.className = 'app-card-name';
  name.textContent = module.name;
  name.title = module.name;

  card.appendChild(icon);
  card.appendChild(name);

  // Клик по карточке
  if (isInstalled) {
    card.addEventListener('click', () => openApp(module));
  } else {
    card.addEventListener('click', () => openAppInfoModal(module, isInstalled));
  }

  return card;
}

function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => {
    if (s) s.classList.remove('active');
  });
  if (screen) screen.classList.add('active');
}