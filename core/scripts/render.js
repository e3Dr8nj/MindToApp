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
    if (module) installedAppsContainer.appendChild(createAppCard(module, true, false));
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';
  
  const standardModules = allModules.filter(m => !m.isCustom);
  
  if (standardModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Склад пуст</p>';
    return;
  }
  
  standardModules.forEach(module => {
    const isInstalled = installedModules.includes(module.id);
    allAppsContainer.appendChild(createAppCard(module, isInstalled, true));
  });
}

function createAppCard(module, isInstalled, isOnStore) {
  const card = document.createElement('div');
  card.className = 'app-card';
  
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

  // Значок настроек (⚙️) в правом верхнем углу
  const settingsBadge = document.createElement('div');
  settingsBadge.className = 'app-card-settings-badge';
  settingsBadge.textContent = '⚙️';
  settingsBadge.title = 'Настройки';
  settingsBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    showCardContextMenu(e, module, isInstalled, isOnStore, settingsBadge);
  });
  card.appendChild(settingsBadge);

  // Значок привязанной ссылки (🔗) в левом верхнем углу
  const linkedUrl = getAppUrl(module.id);
  if (linkedUrl) {
    const linkBadge = document.createElement('div');
    linkBadge.className = 'app-card-link-badge';
    linkBadge.textContent = '🔗';
    linkBadge.title = `Привязана ссылка: ${linkedUrl}`;
    card.appendChild(linkBadge);
  }

  // Кнопки действий под карточкой
  const actions = document.createElement('div');
  actions.className = 'app-card-actions';

  if (isOnStore) {
    // === СКЛАД ===
    if (!isInstalled) {
      // Неустановленное на складе: только кнопка "Установить"
      const installBtn = document.createElement('button');
      installBtn.className = 'app-card-action-btn app-card-action-install';
      installBtn.textContent = '✅';
      installBtn.title = 'Установить';
      installBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleInstall(module.id);
      });
      actions.appendChild(installBtn);

      // Клик по карточке — показать информацию
      card.addEventListener('click', () => openAppInfoModal(module, isInstalled));
    } else {
      // Установленное на складе: нет кнопок под карточкой
      // Клик по карточке — открыть приложение
      card.addEventListener('click', () => openApp(module));
    }
  } else {
    // === РАБОЧИЙ СТОЛ (Мои приложения) ===
    // Все приложения здесь установлены, кнопок под карточкой нет
    // Клик по карточке — открыть приложение
    card.addEventListener('click', () => openApp(module));
  }

  card.appendChild(actions);
  return card;
}

// ==========================================
// КОНТЕКСТНОЕ МЕНЮ КАРТОЧКИ
// ==========================================

let currentContextMenu = null;

function showCardContextMenu(event, module, isInstalled, isOnStore, anchorElement) {
  hideCardContextMenu();

  const menu = document.createElement('div');
  menu.className = 'app-card-context-menu';
  menu.addEventListener('click', (e) => e.stopPropagation());

  if (isOnStore && !isInstalled) {
    // === СКЛАД + НЕУСТАНОВЛЕННОЕ ===
    // Только "Информация" и "Установить"

    const infoItem = createMenuItem('ℹ️', 'Информация', () => {
      hideCardContextMenu();
      openAppInfoModal(module, isInstalled);
    });
    menu.appendChild(infoItem);

    const installItem = createMenuItem('✅', 'Установить', () => {
      hideCardContextMenu();
      toggleInstall(module.id);
    });
    menu.appendChild(installItem);

  } else {
    // === РАБОЧИЙ СТОЛ или УСТАНОВЛЕННОЕ НА СКЛАДЕ ===
    // Полный набор действий

    // Пункт "Информация"
    const infoItem = createMenuItem('ℹ️', 'Информация', () => {
      hideCardContextMenu();
      openAppInfoModal(module, isInstalled);
    });
    menu.appendChild(infoItem);

    // Пункт "Открыть"
    if (isInstalled) {
      const openItem = createMenuItem('🚀', 'Открыть', () => {
        hideCardContextMenu();
        openApp(module);
      });
      menu.appendChild(openItem);
    }

    // Пункт "Редактировать" (только если есть код)
    if (module.content) {
      const editItem = createMenuItem('✏️', 'Редактировать', () => {
        hideCardContextMenu();
        copyCodeWithInstruction(module);
      });
      menu.appendChild(editItem);
    }

    // Пункт "Поделиться" (только если есть код)
    if (module.content) {
      const shareItem = createMenuItem('📤', 'Поделиться', () => {
        hideCardContextMenu();
        openShareModal(module);
      });
      menu.appendChild(shareItem);
    }

    // Пункт "Удалить" (только для установленных)
    if (isInstalled) {
      const deleteItem = createMenuItem('🗑', 'Удалить', () => {
        hideCardContextMenu();
        if (module.isCustom) {
          removeCustomModule(module.id);
        } else {
          toggleInstall(module.id);
        }
      }, 'delete');
      menu.appendChild(deleteItem);
    }
  }

  // Позиционируем меню под иконкой ⚙️
  document.body.appendChild(menu);
  
  const rect = anchorElement.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  
  let top = rect.bottom + 5;
  let left = rect.right - menuRect.width;
  
  if (top + menuRect.height > window.innerHeight) {
    top = rect.top - menuRect.height - 5;
  }
  if (left < 0) {
    left = rect.left;
  }
  
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
  
  currentContextMenu = menu;

  setTimeout(() => {
    document.addEventListener('click', hideCardContextMenuOnClickOutside);
  }, 0);
}

function createMenuItem(icon, text, onClick, className = '') {
  const item = document.createElement('div');
  item.className = `app-card-context-menu-item ${className}`;
  item.innerHTML = `<span class="menu-icon">${icon}</span><span class="menu-text">${text}</span>`;
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return item;
}

function hideCardContextMenu() {
  if (currentContextMenu) {
    currentContextMenu.remove();
    currentContextMenu = null;
  }
  document.removeEventListener('click', hideCardContextMenuOnClickOutside);
}

function hideCardContextMenuOnClickOutside(e) {
  if (currentContextMenu && !currentContextMenu.contains(e.target)) {
    hideCardContextMenu();
  }
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