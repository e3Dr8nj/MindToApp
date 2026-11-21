// ==========================================
// ЛЕНДИНГ ПРИЛОЖЕНИЯ С ХОМЯКОМ (app-landing.js)
// ==========================================

let currentLandingApp = null;

/**
 * Открывает модалку с лендингом приложения
 * @param {Object} app - объект приложения из allModules
 */
function openAppLanding(app) {
  if (!app) return;
  currentLandingApp = app;

  // Определяем URL лендинга
  let landingUrl = app.landingUrl || null;
  if (!landingUrl && app.url) {
    landingUrl = app.url.replace(/\/$/, '') + '/landing.html';
  }

  if (!landingUrl) {
    showToast(t('noLanding') || 'Лендинг не найден', 'error');
    return;
  }

  // Обновляем заголовок
  const titleEl = document.getElementById('landing-modal-title');
  if (titleEl) {
    titleEl.textContent = (app.icon || '📱') + ' ' + (app.name || 'Приложение');
  }

  // Устанавливаем URL iframe
  const iframe = document.getElementById('landing-iframe');
  if (iframe) {
    iframe.src = landingUrl;
  }

  // Показываем/скрываем хомяка в зависимости от статуса установки
  const hamster = document.getElementById('hamster-install');
  if (hamster) {
    const isInstalled = installedModules.includes(app.id);
    hamster.style.display = isInstalled ? 'none' : 'flex';
  }

  // Открываем модалку
  const modal = document.getElementById('app-landing-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Закрывает модалку лендинга
 */
function closeAppLanding() {
  const modal = document.getElementById('app-landing-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  
  // Очищаем iframe, чтобы остановить видео/аудио в фоне
  const iframe = document.getElementById('landing-iframe');
  if (iframe) {
    iframe.src = 'about:blank';
  }
  currentLandingApp = null;
}

/**
 * Устанавливает приложение прямо из лендинга
 */
function installFromLanding() {
  if (!currentLandingApp) return;

  // Вызываем стандартную функцию установки из Склада
  if (typeof installApp === 'function') {
    installApp(currentLandingApp);
  }

  // Скрываем хомяка сразу после клика
  const hamster = document.getElementById('hamster-install');
  if (hamster) {
    hamster.style.display = 'none';
  }

  // Закрываем модалку через 1.5 сек (после появления toast)
  setTimeout(() => {
    closeAppLanding();
  }, 1500);
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-landing-modal-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAppLanding);
  }

  const hamsterBtn = document.getElementById('hamster-install-btn');
  if (hamsterBtn) {
    hamsterBtn.addEventListener('click', installFromLanding);
  }

  // Закрытие по клику на затемненный фон
  const modal = document.getElementById('app-landing-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAppLanding();
      }
    });
  }
});