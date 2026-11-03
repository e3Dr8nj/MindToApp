// ==========================================
// РЕНДЕРИНГ КАРТОЧЕК ПРИЛОЖЕНИЙ
// ==========================================

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
      installedAppsContainer.appendChild(createAppCard(module, true, false));
    }
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';

  const standardModules = allModules.filter(m => !m.isCustom);

  if (standardModules.length === 0) {
    allAppsContainer.innerHTML = `<p style="color: white; text-align: center; grid-column: 1/-1;">${t('storeEmpty')}</p>`;
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

  const icon = document.createElement('div');
  icon.className = 'app-card-icon';
  icon.textContent = module.icon;
  icon.title = module.name;

  const name = document.createElement('div');
  name.className = 'app-card-name';
  name.textContent = module.name;
  name.title = module.name;

  card.appendChild(icon);
  card.appendChild(name);

  // Значок настроек (⚙️)
  const settingsBadge = document.createElement('div');
  settingsBadge.className = 'app-card-settings-badge';
  settingsBadge.textContent = '⚙️';
  settingsBadge.title = t('settings');
  settingsBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    showCardContextMenu(e, module, isInstalled, isOnStore, settingsBadge);
  });
  card.appendChild(settingsBadge);

  // Маркер привязанной ссылки (🔗)
  const linkedUrl = getAppUrl(module.id);
  if (linkedUrl) {
    const linkBadge = document.createElement('div');
    linkBadge.className = 'app-card-link-badge';
    linkBadge.textContent = '🔗';
    linkBadge.title = `${t('linkedUrl')} ${linkedUrl}`;
    card.appendChild(linkBadge);
  }

  const actions = document.createElement('div');
  actions.className = 'app-card-actions';

  if (isOnStore) {
    if (!isInstalled) {
      const installBtn = document.createElement('button');
      installBtn.className = 'app-card-install-btn';
      installBtn.textContent = t('install');
      installBtn.title = t('install');
      installBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleInstall(module.id);
      });
      actions.appendChild(installBtn);

      card.addEventListener('click', () => {
        hideCardContextMenu();
        openAppInfoModal(module, isInstalled);
      });
    } else {
      card.addEventListener('click', () => {
        hideCardContextMenu();
        openApp(module);
      });
    }
  } else {
    card.addEventListener('click', () => {
      hideCardContextMenu();
      openApp(module);
    });
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

  if (isOnStore) {
    const infoItem = createMenuItem('ℹ️', t('info'), () => {
      hideCardContextMenu();
      openAppInfoModal(module, isInstalled);
    });
    menu.appendChild(infoItem);

    if (isInstalled) {
      const openItem = createMenuItem('🚀', t('open'), () => {
        hideCardContextMenu();
        openApp(module);
      });
      menu.appendChild(openItem);

      const deleteItem = createMenuItem('🗑', t('delete'), () => {
        hideCardContextMenu();
        toggleInstall(module.id);
      }, 'delete');
      menu.appendChild(deleteItem);
    } else {
      const installItem = createMenuItem('✅', t('install'), () => {
        hideCardContextMenu();
        toggleInstall(module.id);
      });
      menu.appendChild(installItem);
    }
  } else {
    const infoItem = createMenuItem('ℹ️', t('info'), () => {
      hideCardContextMenu();
      openAppInfoModal(module, isInstalled);
    });
    menu.appendChild(infoItem);

    if (isInstalled) {
      const openItem = createMenuItem('🚀', t('open'), () => {
        hideCardContextMenu();
        openApp(module);
      });
      menu.appendChild(openItem);
    }

    if (module.content) {
      const editItem = createMenuItem('✏️', t('edit'), () => {
        hideCardContextMenu();
        copyCodeWithInstruction(module);
      });
      menu.appendChild(editItem);
    }

    if (module.content) {
      const shareItem = createMenuItem('📤', t('share'), () => {
        hideCardContextMenu();
        openShareModal(module);
      });
      menu.appendChild(shareItem);
    }

    if (isInstalled) {
      const deleteItem = createMenuItem('🗑', t('delete'), () => {
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
  if (top < 5) {
    top = 5;
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
  item.className = `app-card-context-menu-item ${className}`.trim();

  // Защита от задвоения эмодзи: если текст уже начинается с этой же иконки, убираем её
  let displayText = String(text || '').trim();
  const menuIcon = String(icon || '').trim();

  if (menuIcon && displayText.startsWith(menuIcon)) {
    displayText = displayText.slice(menuIcon.length).trim();
  }

  const iconSpan = document.createElement('span');
  iconSpan.className = 'menu-icon';
  iconSpan.textContent = menuIcon;

  const textSpan = document.createElement('span');
  textSpan.className = 'menu-text';
  textSpan.textContent = displayText;

  item.appendChild(iconSpan);
  item.appendChild(textSpan);

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

  hideCardContextMenu();

  if (screen) screen.classList.add('active');
}