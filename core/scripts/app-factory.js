// ==========================================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ СОЗДАНИЯ ПРИЛОЖЕНИЯ
// Из HTML-кода в установленное приложение
// ==========================================

/**
 * Создаёт приложение из HTML-кода.
 * Парсит manifest, валидирует, проверяет уникальность, сохраняет.
 * 
 * @param {string} html - Полный HTML-код приложения
 * @param {object} options - Опции
 * @param {boolean} options.skipRender - Не перерисовывать UI (для пакетных операций)
 * @param {string} options.defaultDescription - Описание по умолчанию, если в manifest нет
 * 
 * @returns {object} Результат:
 *   { success: true, manifest, module } — при успехе
 *   { success: false, error: string } — при ошибке
 *     error может быть: 'noHtml', 'notHtml', 'noManifest', 'invalidManifest', 
 *                       'missingFields', 'appExists'
 */
function createAppFromHtml(html, options = {}) {
  // 1. Проверка входных данных
  if (!html || typeof html !== 'string' || !html.trim()) {
    return { success: false, error: 'noHtml' };
  }

  const trimmedHtml = html.trim();

  // 2. Проверка, что это HTML
  if (!trimmedHtml.includes('<html') && !trimmedHtml.includes('<!DOCTYPE') && !trimmedHtml.includes('<HTML')) {
    return { success: false, error: 'notHtml' };
  }

  // 3. Парсинг manifest
  let doc;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(trimmedHtml, 'text/html');
  } catch (e) {
    return { success: false, error: 'invalidManifest' };
  }

  const manifestScript = doc.getElementById('manifest');
  if (!manifestScript) {
    return { success: false, error: 'noManifest' };
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestScript.textContent);
  } catch (e) {
    return { success: false, error: 'invalidManifest' };
  }

  // 4. Валидация обязательных полей
  if (!manifest.id || !manifest.name || !manifest.icon) {
    return { success: false, error: 'missingFields' };
  }

  // 5. Проверка уникальности ID
  if (allModules.some(m => m.id === manifest.id)) {
    return { success: false, error: 'appExists', manifest };
  }

  // 6. Создание объекта модуля
  const newModule = {
    id: manifest.id,
    name: manifest.name,
    icon: manifest.icon,
    description: manifest.description || options.defaultDescription || 'Created',
    content: trimmedHtml,
    isCustom: true,
    isLocal: true,
    isFolder: false
  };

  // 7. Сохранение в customModules
  customModules.push(newModule);
  localStorage.setItem('customModules', JSON.stringify(customModules));

  // 8. Добавление в installedModules
  if (!installedModules.includes(manifest.id)) {
    installedModules.push(manifest.id);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }

  // 9. Добавление в allModules с URL для iframe
  allModules.push({
    ...manifest,
    content: trimmedHtml,
    url: URL.createObjectURL(new Blob([trimmedHtml], { type: 'text/html' })),
    isCustom: true,
    isLocal: true,
    isFolder: false
  });

  // 10. Рендеринг (если не отключён)
  if (!options.skipRender) {
    if (typeof renderInstalledApps === 'function') renderInstalledApps();
    if (typeof renderAllApps === 'function') renderAllApps();
  }

  return { success: true, manifest, module: newModule };
}

/**
 * Возвращает человекочитаемое сообщение об ошибке создания приложения.
 * Используется для toast-уведомлений и логов.
 */
function getCreateAppErrorMessage(errorCode) {
  const errorMap = {
    'noHtml': 'noHtml',
    'notHtml': 'notHtml',
    'noManifest': 'noManifest',
    'invalidManifest': 'missingFields',
    'missingFields': 'missingFields',
    'appExists': 'appExists'
  };
  const key = errorMap[errorCode] || 'copyFailed';
  return t(key);
}