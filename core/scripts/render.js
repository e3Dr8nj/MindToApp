// ==========================================
// РЕНДЕРИНГ ПРИЛОЖЕНИЙ И КАРТОЧЕК
// ==========================================

function renderInstalledApps() {
  const container = document.getElementById('installed-apps');
  const emptyState = document.getElementById('empty-state');

  if (!container) return;

  container.innerHTML = '';

  const installedApps = installedModules
    .map(id => allModules.find(m => m.id === id))
    .filter(m => m);

  if (installedApps.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  installedApps.forEach(app => {
    const card = createAppCard(app, true);
    container.appendChild(card);
  });
}

function renderAllApps() {
  const container = document.getElementById('all-apps');
  if (!container) return;

  container.innerHTML = '';

  const storeApps = allModules.filter(app => !installedModules.includes(app.id));

  if (storeApps.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--description-color); padding: 40px; grid-column: 1 / -1;">Все доступные приложения уже установлены</div>';
    return;
  }

  storeApps.forEach(app => {
    const card = createAppCard(app, false);
    container.appendChild(card);
  });
}

function createAppCard(app, isInstalled) {
  const card = document.createElement('div');
  card.className = `app-card ${isInstalled ? 'app-card-installed' : ''}`;
  card.dataset.appId = app.id;

  const icon = document.createElement('div');
  icon.className = 'app-card-icon';
  icon.textContent = app.icon;
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    openApp(app);
  });
  card.appendChild(icon);

  const name = document.createElement('div');
  name.className = 'app-card-name';
  name.textContent = app.name;
  card.appendChild(name);

  if (isInstalled) {
    const settingsBadge = document.createElement('div');
    settingsBadge.className = 'app-card-settings-badge';
    settingsBadge.textContent = '⚙️';
    settingsBadge.title = t('settings');
    settingsBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCardContextMenu(e, app);
    });
    card.appendChild(settingsBadge);
  }

  if (isInstalled && typeof getAppUrl === 'function' && getAppUrl(app.id)) {
    const linkBadge = document.createElement('div');
    linkBadge.className = 'app-card-link-badge';
    linkBadge.textContent = '🔗';
    linkBadge.title = t('linkedUrl');
    card.appendChild(linkBadge);
  }

  if (!isInstalled) {
    const installBtn = document.createElement('button');
    installBtn.className = 'app-card-install-btn';
    installBtn.textContent = t('install');
    installBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      installApp(app);
    });
    card.appendChild(installBtn);
  }

  card.addEventListener('click', () => {
    openApp(app);
  });

  return card;
}

function openApp(app) {
  const appScreenEl = document.getElementById('app-screen');
  const appName = document.getElementById('current-app-name');
  const appFrame = document.getElementById('app-frame');
  const sidebar = document.getElementById('sidebar');

  if (!appScreenEl || !appName || !appFrame) return;

  appName.textContent = app.name;

  if (app.url) {
    appFrame.src = app.url;
  } else if (app.content) {
    const blob = new Blob([app.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    appFrame.src = url;
  } else {
    showToast(t('noCode'), 'error');
    return;
  }

  showScreen(appScreenEl);

  if (sidebar) sidebar.classList.add('sidebar-hidden');
}

function installApp(app) {
  if (installedModules.includes(app.id)) {
    showToast(t('appExists'), 'error');
    return;
  }

  installedModules.push(app.id);
  localStorage.setItem('installedModules', JSON.stringify(installedModules));

  renderInstalledApps();
  renderAllApps();

  showToast(t('appCreated', { name: app.name }), 'success', 2000);
}

function uninstallApp(appId) {
  if (!confirm(t('deleteModule'))) return;

  const index = installedModules.indexOf(appId);
  if (index > -1) {
    installedModules.splice(index, 1);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));

    renderInstalledApps();
    renderAllApps();

    showToast('✅ App uninstalled', 'success', 2000);
  }
}

function deleteApp(appId) {
  if (!confirm(t('deleteModule'))) return;

  const installedIndex = installedModules.indexOf(appId);
  if (installedIndex > -1) {
    installedModules.splice(installedIndex, 1);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }

  const customIndex = customModules.findIndex(m => m.id === appId);
  if (customIndex > -1) {
    customModules.splice(customIndex, 1);
    localStorage.setItem('customModules', JSON.stringify(customModules));
  }

  const allIndex = allModules.findIndex(m => m.id === appId);
  if (allIndex > -1) {
    allModules.splice(allIndex, 1);
  }

  renderInstalledApps();
  renderAllApps();

  showToast('✅ App deleted', 'success', 2000);
}

// ==========================================
// КОНТЕКСТНОЕ МЕНЮ КАРТОЧКИ
// Стиль как у выпадающего меню AI в сайдбаре
// ==========================================

// Маппинг: ключ перевода → эмодзи и текст БЕЗ эмодзи
const menuItemIcons = {
  info:         { icon: 'ℹ️', text: 'Info' },
  open:         { icon: '🚀', text: 'Open' },
  edit:         { icon: '✏️', text: 'Edit' },
  share:        { icon: '📤', text: 'Share' },
  downloadHtml: { icon: '📥', text: 'Download HTML' },
  delete:       { icon: '🗑', text: 'Delete' }
};

const menuItemIconsRu = {
  info:         { icon: 'ℹ️', text: 'Информация' },
  open:         { icon: '🚀', text: 'Открыть' },
  edit:         { icon: '✏️', text: 'Редактировать' },
  share:        { icon: '📤', text: 'Поделиться' },
  downloadHtml: { icon: '📥', text: 'Скачать HTML' },
  delete:       { icon: '🗑', text: 'Удалить' }
};

function getMenuItemData(key) {
  const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
  const map = lang === 'ru' ? menuItemIconsRu : menuItemIcons;
  return map[key] || { icon: '', text: t(key) };
}

// Переключение меню (открыть/закрыть)
function toggleCardContextMenu(event, app) {
  event.stopPropagation();
  const existingMenu = document.getElementById('card-context-menu');

  if (existingMenu && existingMenu.dataset.appId === app.id) {
    hideCardContextMenu();
    return;
  }

  hideCardContextMenu();
  showCardContextMenu(event, app);
}

function showCardContextMenu(event, app) {
  const menu = document.createElement('div');
  // Тот же стиль, что и у AI-меню в сайдбаре
  menu.className = 'sidebar-ai-dropdown';
  menu.id = 'card-context-menu';
  menu.dataset.appId = app.id;
  menu.style.display = 'flex';
  menu.style.gap = '4px';
  menu.style.padding = '6px';
  menu.style.maxHeight = '80vh';
  menu.style.overflowY = 'auto';

  const isInstalled = installedModules.includes(app.id);

  // Пункт меню в стиле AI-ссылок
  const createMenuItem = (key, action) => {
    const data = getMenuItemData(key);
    const link = document.createElement('a');
    link.className = 'sidebar-ai-link';
    link.href = '#';
    link.style.cssText = 'cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 10px;';
    link.innerHTML = `<span style="font-size: 16px; width: 20px; text-align: center;">${data.icon}</span><span style="flex: 1; font-size: 13px;">${data.text}</span>`;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideCardContextMenu();
      action();
    });
    return link;
  };

  menu.appendChild(createMenuItem('info', () => showAppInfo(app)));
  menu.appendChild(createMenuItem('open', () => openApp(app)));

  if (isInstalled && app.content) {
    menu.appendChild(createMenuItem('edit', () => {
      if (typeof openEditModal === 'function') openEditModal(app);
    }));
    menu.appendChild(createMenuItem('share', () => {
      if (typeof openShareModal === 'function') openShareModal(app);
    }));
    menu.appendChild(createMenuItem('downloadHtml', () => {
      downloadAppHtml(app);
    }));
  }

  if (isInstalled) {
    const data = getMenuItemData('delete');
    const deleteLink = document.createElement('a');
    deleteLink.className = 'sidebar-ai-link';
    deleteLink.href = '#';
    deleteLink.style.cssText = 'cursor: pointer; text-decoration: none; display: flex; align-items: center; gap: 10px; color: var(--delete-btn-bg);';
    deleteLink.innerHTML = `<span style="font-size: 16px; width: 20px; text-align: center;">${data.icon}</span><span style="flex: 1; font-size: 13px;">${data.text}</span>`;
    deleteLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideCardContextMenu();
      deleteApp(app.id);
    });
    menu.appendChild(deleteLink);
  }

  document.body.appendChild(menu);

  // Позиционирование: привязываем к кнопке ⚙️
  const rect = event.target.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 8;

  // Меню появляется СПРАВА от кнопки ⚙️ (как AI-меню)
  let left = rect.right + 8;
  let top = rect.top;

  if (left + menuRect.width > viewportWidth - margin) {
    left = rect.left - menuRect.width - 8;
  }

  if (top + menuRect.height > viewportHeight - margin) {
    top = viewportHeight - menuRect.height - margin;
  }
  if (top < margin) top = margin;
  if (left < margin) left = margin;

  menu.style.position = 'fixed';
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  // Закрываем меню при клике вне его
  setTimeout(() => {
    document.addEventListener('click', hideCardContextMenu, { once: true });
  }, 0);
}

function hideCardContextMenu() {
  const menu = document.getElementById('card-context-menu');
  if (menu) menu.remove();
}

// ==========================================
// МОДАЛКА ИНФОРМАЦИИ О ПРИЛОЖЕНИИ
// ==========================================

function showAppInfo(app) {
  const modal = document.getElementById('app-info-modal');
  const iconEl = document.getElementById('app-info-icon');
  const nameEl = document.getElementById('app-info-name');
  const descEl = document.getElementById('app-info-desc');
  const linkBlock = document.getElementById('app-info-link-block');
  const actionsEl = document.getElementById('app-info-actions');

  if (!modal) return;

  if (iconEl) iconEl.textContent = app.icon;
  if (nameEl) nameEl.textContent = app.name;
  if (descEl) descEl.textContent = app.description || t('noDescription');

  if (linkBlock) {
    const linkedUrl = typeof getAppUrl === 'function' ? getAppUrl(app.id) : null;
    if (linkedUrl) {
      linkBlock.style.display = 'block';
      linkBlock.innerHTML = `
        <div class="app-info-link-label">${t('linkedUrl')}</div>
        <a href="${linkedUrl}" target="_blank" rel="noopener noreferrer" class="app-info-link-url">${linkedUrl}</a>
      `;
    } else {
      linkBlock.style.display = 'none';
    }
  }

  if (actionsEl) {
    actionsEl.innerHTML = '';

    const isInstalled = installedModules.includes(app.id);

    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn-primary';
    openBtn.textContent = t('open');
    openBtn.addEventListener('click', () => {
      closeAppInfoModal();
      openApp(app);
    });
    actionsEl.appendChild(openBtn);

    if (isInstalled && app.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = t('edit');
      editBtn.addEventListener('click', () => {
        closeAppInfoModal();
        if (typeof openEditModal === 'function') openEditModal(app);
      });
      actionsEl.appendChild(editBtn);

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-secondary';
      shareBtn.textContent = t('share');
      shareBtn.addEventListener('click', () => {
        closeAppInfoModal();
        if (typeof openShareModal === 'function') openShareModal(app);
      });
      actionsEl.appendChild(shareBtn);

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn btn-secondary';
      downloadBtn.textContent = t('downloadHtml');
      downloadBtn.addEventListener('click', () => {
        closeAppInfoModal();
        downloadAppHtml(app);
      });
      actionsEl.appendChild(downloadBtn);
    }

    if (isInstalled) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-secondary';
      deleteBtn.style.color = 'var(--delete-btn-bg)';
      deleteBtn.textContent = t('delete');
      deleteBtn.addEventListener('click', () => {
        closeAppInfoModal();
        deleteApp(app.id);
      });
      actionsEl.appendChild(deleteBtn);
    }
  }

  modal.classList.add('active');
}

function closeAppInfoModal() {
  const modal = document.getElementById('app-info-modal');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// СКАЧИВАНИЕ HTML ПРИЛОЖЕНИЯ
// ==========================================

function downloadAppHtml(app) {
  if (!app || !app.content) {
    showToast(t('noCode'), 'error');
    return;
  }

  const safeName = app.name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 50);

  const filename = `${safeName}_${app.id}.html`;

  const blob = new Blob([app.content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`✅ ${filename}`, 'success', 3000);
}

// ==========================================
// ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
// ==========================================

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (screen) screen.classList.add('active');

  const sidebar = document.getElementById('sidebar');
  const isAppScreen = screen && screen.id === 'app-screen';

  if (sidebar) {
    if (isAppScreen) {
      sidebar.classList.add('sidebar-hidden');
    } else {
      sidebar.classList.remove('sidebar-hidden');
    }
  }
}

function closeApp() {
  const appFrame = document.getElementById('app-frame');
  if (appFrame) appFrame.src = 'about:blank';

  if (typeof homeScreen !== 'undefined') {
    showScreen(homeScreen);
  }
}