// ==========================================
// RESET PWA — полная очистка данных сайта
// ==========================================

async function resetPWAData() {
  if (!confirm('🧹 Сбросить все данные PWA (Service Worker, кэш, локальные данные)?\n\nПриложения и темы будут удалены с этого устройства.')) {
    return;
  }

  try {
    console.log('[Reset] Начинаю сброс PWA...');

    // 1. Отписываем все Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
        console.log('[Reset] SW отписан:', reg.scope);
      }
    }

    // 2. Удаляем весь Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
        console.log('[Reset] Кэш удалён:', name);
      }
    }

    // 3. Удаляем localStorage (приложения, темы, настройки)
    localStorage.clear();
    console.log('[Reset] localStorage очищен');

    // 4. Удаляем все IndexedDB базы
    if (window.indexedDB && window.indexedDB.databases) {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
          console.log('[Reset] IndexedDB удалён:', db.name);
        }
      }
    }

    // 5. Удаляем cookie (если есть)
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    console.log('[Reset] ✅ Сброс завершён!');

    // 6. Жёсткая перезагрузка с новым query-параметром,
    // чтобы браузер точно не использовал старый кэш
    const freshUrl = window.location.pathname + '?reset=' + Date.now();
    window.location.replace(freshUrl);

  } catch (error) {
    console.error('[Reset] ❌ Ошибка сброса:', error);
    alert('Не удалось полностью сбросить данные. Попробуй вручную:\nНастройки → Chrome → Очистить данные сайта.');
  }
}

// Подключаем к кнопке 🧹 Reset PWA
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('reset-pwa-btn');
  if (btn) {
    btn.addEventListener('click', resetPWAData);
  }
});