// ==========================================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ СОЗДАНИЯ ПРИЛОЖЕНИЯ
// Из HTML-кода в установленное приложение
// ==========================================

/**
 * Генерирует случайную строку заданной длины из указанного набора символов.
 * @param {number} length - Длина строки
 * @param {string} charset - Набор символов для генерации
 * @returns {string} Случайная строка
 */
function generateRandomString(length, charset) {
  let result = '';
  const charsetLength = charset.length;
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charsetLength));
  }
  return result;
}

/**
 * Генерирует уникальный ID приложения.
 * Формат: 20 символов (буквы латиницы разного регистра + цифры).
 * @returns {string} Уникальный ID
 */
function generateAppId() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return generateRandomString(20, charset);
}

/**
 * Генерирует случайное имя приложения.
 * Формат: 10 символов (буквы латиницы + цифры).
 * @returns {string} Случайное имя
 */
function generateAppName() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return generateRandomString(10, charset);
}

/**
 * Создаёт объект manifest с дефолтными значениями.
 * @returns {object} Manifest объект
 */
function generateDefaultManifest() {
  return {
    id: generateAppId(),
    name: generateAppName(),
    icon: '📱',
    description: 'no description'
  };
}

/**
 * Вставляет блок manifest в HTML-код.
 * Пытается вставить в <head>, если его нет — в начало HTML.
 * @param {string} html - HTML-код
 * @param {object} manifest - Объект manifest
 * @returns {string} Модифицированный HTML
 */
function injectManifestIntoHtml(html, manifest) {
  const manifestScript = `<script type="application/json" id="manifest">${JSON.stringify(manifest)}</script>`;
  
  // Ищем <head> или </head> для вставки
  const headOpenMatch = html.match(/<head[^>]*>/i);
  const headCloseMatch = html.match(/<\/head>/i);
  
  if (headCloseMatch) {
    // Вставляем перед </head>
    const insertPos = html.indexOf(headCloseMatch[0]);
    return html.slice(0, insertPos) + '\n    ' + manifestScript + '\n  ' + html.slice(insertPos);
  } else if (headOpenMatch) {
    // Вставляем после <head>
    const insertPos = html.indexOf(headOpenMatch[0]) + headOpenMatch[0].length;
    return html.slice(0, insertPos) + '\n    ' + manifestScript + html.slice(insertPos);
  } else {
    // <head> не найден, вставляем в начало
    return manifestScript + '\n' + html;
  }
}

/**
 * Очищает HTML-код от Markdown-обёртки (```html ... ```).
 * @param {string} code - Исходный код
 * @returns {string} Очищенный код
 */
function stripMarkdownWrapper(code) {
  if (!code || typeof code !== 'string') return code;

  let cleaned = code.trim();

  // Вариант 1: внутри текста есть блок ```html ... ``` — вытаскиваем его содержимое
  const blockMatch = cleaned.match(/```(?:html|htm|xml)?\s*\r?\n([\s\S]*?)\r?\n?```/i);
  if (blockMatch) {
    return blockMatch[1].trim();
  }

  // Вариант 2: код просто начинается с ``` и заканчивается ```
  const lines = cleaned.split(/\r?\n/);

  if (lines.length >= 2) {
    const firstLine = lines[0].trim();
    const lastLine = lines[lines.length - 1].trim();

    const firstIsFence = /^```/.test(firstLine);
    const lastIsFence = /^```$/.test(lastLine);

    if (firstIsFence && lastIsFence) {
      lines.shift(); // убираем первую строку
      lines.pop();   // убираем последнюю строку
      cleaned = lines.join('\n').trim();
    } else if (firstIsFence) {
      lines.shift(); // убираем только первую строку, если закрывающей нет
      cleaned = lines.join('\n').trim();
    }
  }

  return cleaned;
}

/**
 * Создаёт приложение из HTML-кода.
 * Парсит manifest, валидирует, проверяет уникальность, сохраняет.
 * Если manifest отсутствует — генерирует и вставляет автоматически.
 * 
 * @param {string} html - Полный HTML-код приложения
 * @param {object} options - Опции
 * @param {boolean} options.skipRender - Не перерисовывать UI (для пакетных операций)
 * @param {string} options.defaultDescription - Описание по умолчанию, если в manifest нет
 * 
 * @returns {object} Результат:
 *   { success: true, manifest, module, manifestGenerated: boolean } — при успехе
 *   { success: false, error: string } — при ошибке
 *     error может быть: 'noHtml', 'notHtml', 'invalidManifest', 'missingFields', 'appExists'
 */
function createAppFromHtml(html, options = {}) {
  // 0. Очистка кода от Markdown-обёртки (```html ... ```)
  html = stripMarkdownWrapper(html);

  // 1. Проверка входных данных
  if (!html || typeof html !== 'string' || !html.trim()) {
    return { success: false, error: 'noHtml' };
  }

  let trimmedHtml = html.trim();

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

  let manifestScript = doc.getElementById('manifest');
  let manifest;
  let manifestGenerated = false;

  // 4. Если manifest отсутствует — генерируем и вставляем
  if (!manifestScript) {
    manifest = generateDefaultManifest();
    trimmedHtml = injectManifestIntoHtml(trimmedHtml, manifest);
    manifestGenerated = true;
    
    // Перепарсиваем HTML с новым manifest
    doc = new DOMParser().parseFromString(trimmedHtml, 'text/html');
    manifestScript = doc.getElementById('manifest');
  } else {
    // 5. Парсим существующий manifest
    try {
      manifest = JSON.parse(manifestScript.textContent);
    } catch (e) {
      return { success: false, error: 'invalidManifest' };
    }

    // 6. Валидация обязательных полей
    if (!manifest.id || !manifest.name || !manifest.icon) {
      return { success: false, error: 'missingFields' };
    }
  }

  // 7. Проверка уникальности ID
  if (allModules.some(m => m.id === manifest.id)) {
    return { success: false, error: 'appExists', manifest };
  }

  // 8. Создание объекта модуля
  const newModule = {
    id: manifest.id,
    name: manifest.name,
    icon: manifest.icon,
    description: manifest.description || options.defaultDescription || 'no description',
    content: trimmedHtml,
    isCustom: true,
    isLocal: true,
    isFolder: false
  };

  // 9. Сохранение в customModules
  customModules.push(newModule);
  localStorage.setItem('customModules', JSON.stringify(customModules));

  // 10. Добавление в installedModules
  if (!installedModules.includes(manifest.id)) {
    installedModules.push(manifest.id);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }

  // 11. Добавление в allModules с URL для iframe
  allModules.push({
    ...manifest,
    content: trimmedHtml,
    url: URL.createObjectURL(new Blob([trimmedHtml], { type: 'text/html' })),
    isCustom: true,
    isLocal: true,
    isFolder: false
  });

  // 12. Рендеринг (если не отключён)
  if (!options.skipRender) {
    if (typeof renderInstalledApps === 'function') renderInstalledApps();
    if (typeof renderAllApps === 'function') renderAllApps();
  }

  return { 
    success: true, 
    manifest, 
    module: newModule,
    manifestGenerated
  };
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