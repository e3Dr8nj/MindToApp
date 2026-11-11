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

  // В складе показываем ТОЛЬКО те приложения, которые еще НЕ установлены
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

  // Иконка
  const icon = document.createElement('div');
  icon.className = 'app-card-icon';
  icon.textContent = app.icon;
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    openApp(app);
  });
  card.appendChild(icon);

  // Название
  const name = document.createElement('div');
  name.className = 'app-card-name';
  name.textContent = app.name;
  card.appendChild(name);

  // Если приложение установлено — добавляем значок настроек
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

  // Если есть привязанная ссылка — добавляем значок
  if (isInstalled && typeof getAppUrl === 'function' && getAppUrl(app.id)) {
    const linkBadge = document.createElement('div');
    linkBadge.className = 'app-card-link-badge';
    linkBadge.textContent = '🔗';
    linkBadge.title = t('linkedUrl');
    card.appendChild(linkBadge);
  }

  // Если приложение НЕ установлено — показываем кнопку "Установить"
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

  // Клик по карточке — открыть приложение
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

  // Если есть URL — открываем по URL, иначе из content
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

  // Скрываем сайдбар при открытии приложения
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

  // Удаляем из installedModules
  const installedIndex = installedModules.indexOf(appId);
  if (installedIndex > -1) {
    installedModules.splice(installedIndex, 1);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }

  // Удаляем из customModules
  const customIndex = customModules.findIndex(m => m.id === appId);
  if (customIndex > -1) {
    customModules.splice(customIndex, 1);
    localStorage.setItem('customModules', JSON.stringify(customModules));
  }

  // Удаляем из allModules
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

function showCardContextMenu(event, app) {
  hideCardContextMenu();

  const menu = document.createElement('div');
  menu.className = 'app-card-context-menu';
  menu.id = 'card-context-menu';

  const isInstalled = installedModules.includes(app.id);

  // Заголовок меню с названием приложения (чтобы было понятно, к чему относится)
  const header = document.createElement('div');
  header.style.cssText = 'padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--description-color); border-bottom: 1px solid var(--input-border); display: flex; align-items: center; gap: 8px;';
  header.innerHTML = `<span style="font-size: 18px;">${app.icon}</span><span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.name}</span>`;
  menu.appendChild(header);

  // Вспомогательная функция для создания пунктов меню
  // Используем стандартную структуру с .menu-icon и .menu-text из CSS
  const createMenuItem = (textKey, action) => {
    const btn = document.createElement('button');
    btn.className = 'app-card-context-menu-item';
    // Пустой .menu-icon сохраняет CSS-структуру (flex: 1 у .menu-text)
    // Текст из перевода уже содержит эмодзи — иконка остаётся пустой
    btn.innerHTML = `<span class="menu-icon"></span><span class="menu-text">${t(textKey)}</span>`;
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
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'app-card-context-menu-item delete';
    deleteBtn.innerHTML = `<span class="menu-icon"></span><span class="menu-text">${t('delete')}</span>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideCardContextMenu();
      deleteApp(app.id);
    });
    menu.appendChild(deleteBtn);
  }

  document.body.appendChild(menu);

  // Позиционирование: привязываем к КАРТОЧКЕ приложения, а не к кнопке ⚙️
  const cardEl = event.target.closest('.app-card');
  const cardRect = cardEl ? cardEl.getBoundingClientRect() : event.target.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 8;

  // На мобильном (≤ 600px) меню растягивается на всю ширину карточки
  const isMobile = viewportWidth <= 600;

  let top, left;

  if (isMobile) {
    // Мобильный: меню под карточкой, на всю ширину карточки
    left = cardRect.left;
    top = cardRect.bottom + 4;

    // Если не помещается снизу — показываем над карточкой
    if (top + menuRect.height > viewportHeight - margin) {
      top = cardRect.top - menuRect.height - 4;
    }

    // Если всё равно не помещается сверху — прижимаем к верху экрана
    if (top < margin) top = margin;

    // Растягиваем меню на ширину карточки (но не больше экрана)
    const menuWidth = Math.min(cardRect.width, viewportWidth - margin * 2);
    menu.style.width = menuWidth + 'px';

    // Центрируем по горизонтали, если карточка уже меню
    if (cardRect.width > menuWidth) {
      left = cardRect.left + (cardRect.width - menuWidth) / 2;
    }
  } else {
    // Десктоп: меню справа от карточки, выровнено по верху
    left = cardRect.right + 8;
    top = cardRect.top;

    // Если не помещается справа — показываем слева от карточки
    if (left + menuRect.width > viewportWidth - margin) {
      left = cardRect.left - menuRect.width - 8;
    }

    // Если не помещается по вертикали — прижимаем к нижнему краю экрана
    if (top + menuRect.height > viewportHeight - margin) {
      top = viewportHeight - menuRect.height - margin;
    }
    if (top < margin) top = margin;
  }

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

  // Показываем привязанную ссылку, если есть
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

  // Кнопки действий
  if (actionsEl) {
    actionsEl.innerHTML = '';

    const isInstalled = installedModules.includes(app.id);

    // Open
    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn-primary';
    openBtn.textContent = t('open');
    openBtn.addEventListener('click', () => {
      closeAppInfoModal();
      openApp(app);
    });
    actionsEl.appendChild(openBtn);

    // Edit
    if (isInstalled && app.content) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = t('edit');
      editBtn.addEventListener('click', () => {
        closeAppInfoModal();
        if (typeof openEditModal === 'function') openEditModal(app);
      });
      actionsEl.appendChild(editBtn);
    }

    // Share
    if (isInstalled && app.content) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-secondary';
      shareBtn.textContent = t('share');
      shareBtn.addEventListener('click', () => {
        closeAppInfoModal();
        if (typeof openShareModal === 'function') openShareModal(app);
      });
      actionsEl.appendChild(shareBtn);
    }

    // Download HTML
    if (isInstalled && app.content) {
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn btn-secondary';
      downloadBtn.textContent = t('downloadHtml');
      downloadBtn.addEventListener('click', () => {
        closeAppInfoModal();
        downloadAppHtml(app);
      });
      actionsEl.appendChild(downloadBtn);
    }

    // Delete
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

  // Формируем безопасное имя файла
  const safeName = app.name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 50);

  const filename = `${safeName}_${app.id}.html`;

  // Создаём Blob и скачиваем
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

  // Показываем/скрываем сайдбар
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

  // homeScreen — глобальная переменная из state.js
  if (typeof homeScreen !== 'undefined') {
    showScreen(homeScreen);
  }
}