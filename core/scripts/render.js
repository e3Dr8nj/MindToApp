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
  card.innerHTML = `<div class="app-icon">${module.icon}</div><div class="app-name">${module.name}</div><div class="app-description">${module.description}</div>`;
  
  if (!isInstalled) {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn' + (installedModules.includes(module.id) ? ' installed' : '');
    installBtn.textContent = installedModules.includes(module.id) ? 'Удалить' : 'Установить';
    installBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleInstall(module.id); });
    card.appendChild(installBtn);
  } else {
    card.addEventListener('click', () => openApp(module));
  }
  
  // Кнопка шаринга — для ВСЕХ модулей с контентом (и из магазина тоже)
  if (module.content) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = '📤';
    shareBtn.title = 'Поделиться / Хостинг';
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openShareModal(module);
    });
    card.appendChild(shareBtn);
  }
  
  // Кнопка редактирования — для всех модулей с контентом
  if (module.content) {
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      openEditModal(module); 
    });
    card.appendChild(editBtn);
  }
  
  // Кнопка удаления — только для пользовательских модулей
  if (module.isCustom) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Удалить модуль';
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); removeCustomModule(module.id); });
    card.appendChild(deleteBtn);
  }
  
  return card;
}

function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}