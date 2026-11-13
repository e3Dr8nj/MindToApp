// ==========================================
// СБРОС ДАННЫХ PWA
// Очищает Service Workers, Cache Storage, IndexedDB
// НЕ трогает localStorage (приложения, темы, настройки остаются)
// ==========================================

(function () {
  'use strict';

  const TEXTS = {
    en: {
      confirm: 'Reset PWA data?\n\nThis will clear:\n• Service Workers\n• Browser cache\n• IndexedDB (folder handles)\n\nYour apps, themes and settings will NOT be deleted.\n\nThe page will reload afterwards.',
      done: 'PWA data reset:\n\n',
      reloading: '\n\nReloading page...',
      noSw: '✓ No Service Workers found',
      swOk: '✓ Service Workers removed: ',
      cacheOk: '✓ Cache cleared: ',
      dbOk: '✓ IndexedDB cleared',
      fail: '✗ Error: '
    },
    ru: {
      confirm: 'Сбросить данные PWA?\n\nБудет очищено:\n• Service Workers\n• Кэш браузера\n• IndexedDB (привязки папок)\n\nВаши приложения, темы и настройки НЕ будут удалены.\n\nПосле этого страница перезагрузится.',
      done: 'Данные PWA сброшены:\n\n',
      reloading: '\n\nПерезагрузка страницы...',
      noSw: '✓ Service Workers не найдены',
      swOk: '✓ Service Workers удалено: ',
      cacheOk: '✓ Кэш очищен, записей: ',
      dbOk: '✓ IndexedDB очищена',
      fail: '✗ Ошибка: '
    }
  };

  function getLang() {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'ru' || saved === 'en') return saved;
    } catch (e) {}
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('ru') ? 'ru' : 'en';
  }

  async function resetPwa() {
    const lang = getLang();
    const T = TEXTS[lang] || TEXTS.en;

    if (!confirm(T.confirm)) return;

    const results = [];

    // 1. Service Workers
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        let count = 0;
        for (const reg of regs) {
          if (await reg.unregister()) count++;
        }
        results.push(count > 0 ? T.swOk + count : T.noSw);
      } else {
        results.push(T.noSw);
      }
    } catch (e) {
      results.push(T.fail + e.message);
    }

    // 2. Cache Storage
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
        results.push(T.cacheOk + keys.length);
      }
    } catch (e) {
      results.push(T.fail + e.message);
    }

    // 3. IndexedDB (только служебные базы привязок папок)
    try {
      const dbNames = ['MindToAppExportDB', 'MindToAppImportDB'];
      for (const name of dbNames) {
        indexedDB.deleteDatabase(name);
      }
      results.push(T.dbOk);
    } catch (e) {
      results.push(T.fail + e.message);
    }

    alert(T.done + results.join('\n') + T.reloading);

    setTimeout(function () {
      location.reload(true);
    }, 1200);
  }

  function init() {
    const btn = document.getElementById('reset-pwa-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      resetPwa();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();