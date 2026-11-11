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
      showCardContextMenu(e, app);
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
// ==========================================

// Маппинг: ключ перевода → эмодзи и текст БЕЗ эмодзи
// Чтобы не было задвоения (в переводах уже есть эмодзи)
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

function showCardContextMenu(event, app) {
  hideCardContextMenu();

  const menu = document.createElement('div');
  menu.className = 'app-card-context-menu';
  menu.id = 'card-context-menu';

  const isInstalled = installedModules.includes(app.id);

  // Заголовок меню — иконка + название приложения
  const header = document.createElement('div');
  header.style.cssText = 'padding: 10px 14px; font-size: 14px; font-weight: 600; color: var(--heading-color); border-bottom: 1px solid var(--input-border); display: flex; align-items: center; gap: 10px;';
  header.innerHTML = `<span style="font-size: 20px;">${app.icon}</span><span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.name}</span>`;
  menu.appendChild(header);

  // Создаём пункт меню: эмодзи в .menu-icon, текст в .menu-text
  const createMenuItem = (key, action) => {
    const data = getMenuItemData(key);
    const btn = document.createElement('button');
    btn.className = 'app-card-context-menu-item';
    btn.innerHTML = `<span class="menu-icon">${data.icon}</span><span class="menu-text">${data.text}</span>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideCardContextMenu();
      action();
    });
    return btn;
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
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'app-card-context-menu-item delete';
    deleteBtn.innerHTML = `<span class="menu-icon">${data.icon}</span><span class="menu-text">${data.text}</span>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideCardContextMenu();
      deleteApp(app.id);
    });
    menu.appendChild(deleteBtn);
  }

  document.body.appendChild(menu);

  // Позиционирование: привязываем к КАРТОЧКЕ приложения
  const cardEl = event.target.closest('.app-card');
  const cardRect = cardEl ? cardEl.getBoundingClientRect() : event.target.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 8;

  const isMobile = viewportWidth <= 600;

  let top, left;

  if (isMobile) {
    // Мобильный: меню под карточкой, на всю её ширину
    left = cardRect.left;
    top = cardRect.bottom + 4;

    if (top + menuRect.height > viewportHeight - margin) {
      top = cardRect.top - menuRect.height - 4;
    }
    if (top < margin) top = margin;

    // Растягиваем на ширину карточки (но не шире экрана)
    const menuWidth = Math.min(cardRect.width, viewportWidth - margin * 2);
    menu.style.width = menuWidth + 'px';

    if (cardRect.width > menuWidth) {
      left = cardRect.left + (cardRect.width - menuWidth) / 2;
    }
  } else {
    // Десктоп: меню справа от карточки
    left = cardRect.right + 8;
    top = cardRect.top;

    if (left + menuRect.width > viewportWidth - margin) {
      left = cardRect.left - menuRect.width - 8;
    }

    if (top + menuRect.height > viewportHeight - margin) {
      top = viewportHeight - menuRect.height - margin;
    }
    if (top < margin) top = margin;
  }

  menu.style.position = 'fixed';
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

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