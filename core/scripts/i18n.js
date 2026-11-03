// ==========================================
// СИСТЕМА ЛОКАЛИЗАЦИИ (i18n)
// ==========================================

const translations = {
  en: {
    // Промпт — массив строк, соединённых через \n
    prompt: [
      'CRITICAL PLATFORM RULES:',
      '1. Format: Return ONLY complete, ready-to-use code for a single index.html file, wrapped in one markdown code block (```html ... ```). DO NOT shorten code, DO NOT write "...rest of code unchanged". HTML must be provided in full, from <!DOCTYPE html> to </html>, so it can be copied with one click.',
      '2. Manifest: In <head> there must be <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"emoji", "description":"..."}</script>. If name ends with v and a number, increment it; otherwise add v1 at the end.',
      '3. Unique ID: Add 6 random digits to the "id" field in manifest (e.g., "calculator-482915", "notes-739201"). This is required for uniqueness.',
      '4. Styles and scripts: All CSS must be inside <style>, all JS inside <script>. No external libraries or CDN.',
      '5. Responsiveness: body { min-height: calc(100vh - 60px); margin: 0; }. App must work on desktop and mobile.',
      '6. Restrictions: No alert(), confirm(), prompt() (blocked in iframe). Images/audio only in Base64.',
      '7. Add ability to manage saved data.',
      '',
      'Return ONLY complete HTML code in one markdown block. DO NOT add text explanations.'
    ].join('\n'),

    // Инструкция для редактирования
    editInstruction: [
      '',
      '',
      'EDITING INSTRUCTION:',
      'Below is the complete code of an existing application. Your task is to improve or modify it according to the user\'s request.',
      '',
      'CRITICAL REQUIREMENTS:',
      '1. Return ONLY the FULL, complete HTML code of the improved application in one markdown code block (```html ... ```).',
      '2. DO NOT shorten the code, DO NOT write "...rest of code unchanged" or similar phrases.',
      '3. The HTML must be provided in full, from <!DOCTYPE html> to </html>, ready to copy with one click.',
      '4. Keep the same manifest values (id, name, icon, description) UNLESS the user explicitly asks to change them.',
      '5. If the user asks to change the name, update the version number (e.g., "MyApp v1" → "MyApp v2").',
      '6. Preserve the unique ID in manifest (the 6-digit suffix) — do not generate a new one.',
      '7. Maintain the same general structure, styling approach, and functionality unless explicitly asked to change.',
      '8. All CSS must remain inside <style>, all JS inside <script>. No external libraries or CDN.',
      '9. Ensure the app remains responsive (works on desktop and mobile).',
      '10. No alert(), confirm(), prompt() — they are blocked in iframe.',
      '',
      'Your goal: make the requested improvements while keeping the app fully functional and complete.'
    ].join('\n'),

    // Интерфейс
    myApps: '🏠 My Apps',
    store: '📦 Store',
    themes: '🎨 Themes',
    ai: '🤖 AI',
    promptBtn: '⚙️ Prompt',
    builder: '🛠 Builder',
    add: '➕ Add',
    exportUrls: '📤 Export URLs',
    refresh: '🔄',
    prompt: '📋 prompt',
    create: '🚀 Create',
    url: '🔗 URL',
    describeIdea: '💡 Describe your idea',
    describeIdeaPlaceholder: 'For example: Expense calculator with charts, dark theme, and history saved in localStorage...',
    copyPrompt: '📋 Copy prompt',
    sendToAI: '🤖 Send to AI',
    sendToAIDesc: 'Paste the copied prompt into any AI and wait for the response.',
    openAI: '🌐 Open AI',
    afterResponse: 'After receiving the response, copy the entire HTML code.',
    createApp: '🚀 Create app',
    createAppDesc: 'Paste the HTML code returned by AI and click "Create".',
    codeInputPlaceholder: 'Paste the entire HTML code from AI here...',
    storeEmpty: 'Store is empty',
    install: 'Install',
    info: 'ℹ️ Info',
    open: '🚀 Open',
    edit: '✏️ Edit',
    share: '📤 Share',
    delete: '🗑 Delete',
    settings: 'Settings',
    appInfo: 'Application',
    noDescription: 'No description',
    linkedUrl: '🔗 Linked URL:',
    shareApp: '📤 Share app',
    step1CopyCode: '📋 Step 1: Copy code',
    step1Desc: 'Copy the entire HTML code of the app to clipboard.',
    copyCode: '📋 Copy code',
    step2Host: '🌐 Step 2: Host and get link',
    step2Desc: 'Open a service, paste the code, save it, and copy the link.',
    step3Bind: '🔗 Step 3: Bind link to app',
    step3Desc: 'Paste the link to the hosted app. It will be saved and available for export.',
    bindUrl: '🔗 Bind link',
    unbindUrl: '✂️ Unbind',
    exportUrlsTitle: '📤 Export URLs',
    exportDesc: 'List of apps from "My Apps" with bound links.',
    noLinkedApps: '📭 No apps with bound links',
    noLinkedAppsDesc: 'Bind links via the "📤" button on app cards.',
    copyList: '📋 Copy list',
    promptEditor: '⚙️ Prompt editor',
    promptEditorDesc: 'This prompt is used when creating and editing apps. Change it to customize AI behavior.',
    resetToDefault: '🔄 Reset to default',
    saveChanges: '💾 Save changes',
    aiList: '🤖 AI list',
    aiListDesc: 'Order in list = order in menu.',
    newAI: '➕ New AI',
    editAI: '✏️ Edit AI',
    name: 'Name',
    namePlaceholder: 'For example: Qwen Chat',
    urlPlaceholder: 'https://chat.qwenlm.ai',
    save: '💾 Save',
    cancel: 'Cancel',
    addAI: '➕ Add AI',
    resetList: '🔄 Reset list',
    clipboard: '📋 Clipboard',
    clipboardEmpty: '📋 Clipboard is empty',
    clipboardEmptyDesc: 'Copy text or link and press the button again',
    promptCopied: '✅ Prompt copied',
    codeCopied: '✅ Code copied to clipboard!',
    listCopied: '✅ List copied to clipboard!',
    urlBound: '✅ Link bound to app!',
    urlUnbound: '✅ Link unbound',
    appCreated: '✅ "{name}" created!',
    enterIdea: '❌ First describe the app idea',
    enterCode: '❌ Paste HTML code from AI',
    notHtml: '❌ This doesn\'t look like HTML code',
    noCode: '❌ App has no code',
    enterUrl: '❌ Enter link',
    invalidUrl: '❌ Link must start with https://',
    fillAllFields: '❌ Fill all fields',
    nothingToCopy: '❌ Nothing to copy',
    copyFailed: '❌ Failed to copy',
    emptyClipboard: '❌ Clipboard is empty',
    noManifest: '❌ Manifest not found in code',
    missingFields: '❌ Manifest is missing fields',
    appExists: '❌ App with this ID already exists',
    noHtml: '❌ No HTML code in clipboard',
    loadFailed: '❌ Failed to load: {message}',
    noHtmlAtUrl: '❌ No HTML code at the link',
    deleteModule: 'Delete this module?',
    deleteNetwork: 'Delete AI "{name}"?',
    resetListConfirm: 'Reset AI list to default?',
    resetPromptConfirm: 'Reset prompt to default?',
    promptSaved: '✅ Prompt saved!',
    promptReset: '✅ Prompt reset to default',
    promptEmpty: '❌ Prompt cannot be empty',
    aiSaved: '✅ AI saved!',
    urlMustStart: '❌ URL must start with http:// or https://',
    browserNotSupported: '❌ Your browser doesn\'t support clipboard reading',
    close: 'Close',
    back: '← Back',
    copied: '✅ Copied!',
    opening: '🔗 Opening URL...',
    reading: '📋 Reading clipboard...',
    analyzing: '⏳ Analyzing code...',
    created: '✅ Created!',
    loadingByUrl: '🔗 Loading by link...',
    codeLoaded: '✅ Code loaded from link'
  },

  ru: {
    // Промпт — массив строк, соединённых через \n
    prompt: [
      'КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:',
      '1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (```html ... ```). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.',
      '2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>. Если в значении name в конце есть v и номер после, то увеличь номер версии, если такого нет, поставь v1 в конце.',
      '3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.',
      '4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.',
      '5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.',
      '6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.',
      '7. Добавь возможность управления сохраненными данными.',
      '',
      'Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.'
    ].join('\n'),

    // Инструкция для редактирования
    editInstruction: [
      '',
      '',
      'ИНСТРУКЦИЯ ДЛЯ РЕДАКТИРОВАНИЯ:',
      'Ниже представлен полный код существующего приложения. Твоя задача — улучшить или изменить его согласно запросу пользователя.',
      '',
      'КРИТИЧЕСКИ ВАЖНЫЕ ТРЕБОВАНИЯ:',
      '1. Верни ТОЛЬКО ПОЛНЫЙ, завершённый HTML-код улучшенного приложения в одном блоке markdown (```html ... ```).',
      '2. НЕ сокращай код, НЕ пиши "...остальной код без изменений" или подобные фразы.',
      '3. HTML должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, готовый к копированию одной кнопкой.',
      '4. Сохраняй те же значения manifest (id, name, icon, description), ЕСЛИ пользователь явно не попросил их изменить.',
      '5. Если пользователь просит изменить название — увеличь номер версии (например, "MyApp v1" → "MyApp v2").',
      '6. Сохраняй уникальный ID в manifest (6-значный суффикс) — не генерируй новый.',
      '7. Поддерживай ту же общую структуру, подход к стилям и функциональность, если явно не попросят изменить.',
      '8. Весь CSS должен оставаться внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.',
      '9. Убедись, что приложение остаётся адаптивным (работает на десктопе и мобильных).',
      '10. Никаких alert(), confirm(), prompt() — они блокируются в iframe.',
      '',
      'Твоя цель: внести запрошенные улучшения, сохранив приложение полностью функциональным и завершённым.'
    ].join('\n'),

    // Интерфейс
    myApps: '🏠 Мои приложения',
    store: '📦 Склад',
    themes: '🎨 Темы',
    ai: '🤖 ИИ',
    promptBtn: '⚙️ Промпт',
    builder: '🛠 Конструктор',
    add: '➕ Добавить',
    exportUrls: '📤 Экспорт ссылок',
    refresh: '🔄',
    prompt: '📋 prompt',
    create: '🚀 Создать',
    url: '🔗 URL',
    describeIdea: '💡 Опишите идею',
    describeIdeaPlaceholder: 'Например: Калькулятор расходов с графиками, тёмной темой и сохранением истории в localStorage...',
    copyPrompt: '📋 Скопировать промпт',
    sendToAI: '🤖 Отправьте в нейросеть',
    sendToAIDesc: 'Вставьте скопированный промпт в любую нейросеть и дождитесь ответа.',
    openAI: '🌐 Открыть нейросеть',
    afterResponse: 'После получения ответа скопируйте весь HTML-код.',
    createApp: '🚀 Создайте приложение',
    createAppDesc: 'Вставьте HTML-код, который вернула нейросеть, и нажмите "Создать".',
    codeInputPlaceholder: 'Вставьте сюда весь HTML-код от нейросети...',
    storeEmpty: 'Склад пуст',
    install: 'Установить',
    info: 'ℹ️ Информация',
    open: '🚀 Открыть',
    edit: '✏️ Редактировать',
    share: '📤 Поделиться',
    delete: '🗑 Удалить',
    settings: 'Настройки',
    appInfo: 'Приложение',
    noDescription: 'Нет описания',
    linkedUrl: '🔗 Привязанная ссылка:',
    shareApp: '📤 Поделиться приложением',
    step1CopyCode: '📋 Шаг 1: Скопировать код',
    step1Desc: 'Скопируйте весь HTML-код приложения в буфер обмена.',
    copyCode: '📋 Скопировать код',
    step2Host: '🌐 Шаг 2: Разместить и получить ссылку',
    step2Desc: 'Откройте сервис, вставьте код, сохраните и скопируйте ссылку.',
    step3Bind: '🔗 Шаг 3: Привяжите ссылку к приложению',
    step3Desc: 'Вставьте ссылку на размещённое приложение. Она сохранится и будет доступна для экспорта.',
    bindUrl: '🔗 Привязать ссылку',
    unbindUrl: '✂️ Отвязать',
    exportUrlsTitle: '📤 Экспорт ссылок',
    exportDesc: 'Список приложений из «Мои приложения» с привязанными ссылками.',
    noLinkedApps: '📭 Нет приложений с привязанными ссылками',
    noLinkedAppsDesc: 'Привяжите ссылки через кнопку «📤» на карточках приложений.',
    copyList: '📋 Скопировать список',
    promptEditor: '⚙️ Редактор промпта',
    promptEditorDesc: 'Этот промпт используется при создании и редактировании приложений. Измените его, чтобы настроить поведение нейросети.',
    resetToDefault: '🔄 Сбросить к стандартному',
    saveChanges: '💾 Сохранить изменения',
    aiList: '🤖 Список нейросетей',
    aiListDesc: 'Порядок в списке = порядок в меню.',
    newAI: '➕ Новая нейросеть',
    editAI: '✏️ Редактировать нейросеть',
    name: 'Название',
    namePlaceholder: 'Например: Qwen Chat',
    urlPlaceholder: 'https://chat.qwenlm.ai',
    save: '💾 Сохранить',
    cancel: 'Отмена',
    addAI: '➕ Добавить нейросеть',
    resetList: '🔄 Сбросить список',
    clipboard: '📋 Буфер обмена',
    clipboardEmpty: '📋 Буфер обмена пуст',
    clipboardEmptyDesc: 'Скопируйте текст или ссылку и нажмите кнопку снова',
    promptCopied: '✅ Промпт скопирован',
    codeCopied: '✅ Код скопирован в буфер обмена!',
    listCopied: '✅ Список скопирован в буфер обмена!',
    urlBound: '✅ Ссылка привязана к приложению!',
    urlUnbound: '✅ Ссылка отвязана',
    appCreated: '✅ "{name}" создано!',
    enterIdea: '❌ Сначала опишите идею приложения',
    enterCode: '❌ Вставьте HTML-код от нейросети',
    notHtml: '❌ Это не похоже на HTML-код',
    noCode: '❌ У приложения нет кода',
    enterUrl: '❌ Введите ссылку',
    invalidUrl: '❌ Ссылка должна начинаться с https://',
    fillAllFields: '❌ Заполните все поля',
    nothingToCopy: '❌ Нечего копировать',
    copyFailed: '❌ Не удалось скопировать',
    emptyClipboard: '❌ Буфер обмена пуст',
    noManifest: '❌ Не найден manifest в коде',
    missingFields: '❌ В manifest не хватает полей',
    appExists: '❌ Приложение с таким ID уже есть',
    noHtml: '❌ В буфере нет HTML-кода',
    loadFailed: '❌ Не удалось загрузить: {message}',
    noHtmlAtUrl: '❌ По ссылке нет HTML-кода',
    deleteModule: 'Удалить этот модуль?',
    deleteNetwork: 'Удалить нейросеть "{name}"?',
    resetListConfirm: 'Сбросить список нейросетей к стандартному?',
    resetPromptConfirm: 'Сбросить промпт к стандартному значению?',
    promptSaved: '✅ Промпт сохранён!',
    promptReset: '✅ Промпт сброшен к стандартному',
    promptEmpty: '❌ Промпт не может быть пустым',
    aiSaved: '✅ Нейросеть сохранена!',
    urlMustStart: '❌ URL должен начинаться с http:// или https://',
    browserNotSupported: '❌ Ваш браузер не поддерживает чтение буфера обмена',
    close: 'Закрыть',
    back: '← Назад',
    copied: '✅ Скопировано!',
    opening: '🔗 Открываю URL...',
    reading: '📋 Чтение буфера обмена...',
    analyzing: '⏳ Анализ кода...',
    created: '✅ Создано!',
    loadingByUrl: '🔗 Загружаю по ссылке...',
    codeLoaded: '✅ Код загружен по ссылке'
  }
};

// ==========================================
// ФУНКЦИИ УПРАВЛЕНИЯ ЯЗЫКОМ
// ==========================================

function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

function setLanguage(lang) {
  if (!translations[lang]) {
    console.error('Language "' + lang + '" not supported');
    return;
  }
  localStorage.setItem('language', lang);
  applyLanguage();
}

function t(key, params) {
  var lang = getCurrentLanguage();
  var text = translations[lang][key] || translations['en'][key] || key;

  if (params) {
    Object.keys(params).forEach(function(paramKey) {
      text = text.replace(new RegExp('\\{' + paramKey + '\\}', 'g'), params[paramKey]);
    });
  }

  return text;
}

function applyLanguage() {
  var lang = getCurrentLanguage();

  var textUpdates = [
    { selector: '#home-screen > header > h1', key: 'myApps' },
    { selector: '#open-store-btn', key: 'store' },
    { selector: '#manage-themes-btn', key: 'themes' },
    { selector: '#manage-ai-btn', key: 'ai' },
    { selector: '#edit-prompts-btn', key: 'promptBtn' },
    { selector: '#builder-btn', key: 'builder' },
    { selector: '#add-custom-btn', key: 'add' },
    { selector: '#export-urls-btn', key: 'exportUrls' },
    { selector: '#sidebar-prompt-btn', key: 'prompt', isHtml: true },
    { selector: '#sidebar-create-btn', key: 'create', isHtml: true },
    { selector: '#sidebar-url-btn', key: 'url', isHtml: true },
    { selector: '#store-screen > header > h1', key: 'store' },
    { selector: '#add-custom-btn-store', key: 'add' },
    { selector: '#clipboard-screen > header > h1', key: 'clipboard' },
    { selector: '#close-app-btn', key: 'back', isHtml: true },
    { selector: '#close-clipboard-screen-btn', key: 'back', isHtml: true },
    { selector: '#back-to-home-btn', key: 'back', isHtml: true },
    { selector: '#empty-state > button', key: 'store' }
  ];

  textUpdates.forEach(function(item) {
    var el = document.querySelector(item.selector);
    if (el) {
      var text = t(item.key);
      if (item.isHtml) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });

  var langBtn = document.getElementById('language-toggle-btn');
  if (langBtn) {
    langBtn.textContent = lang === 'en' ? '🇷🇺' : '🇬🇧';
    langBtn.title = lang === 'en' ? 'Switch to Russian' : 'Переключить на английский';
  }

  if (typeof renderInstalledApps === 'function') renderInstalledApps();
  if (typeof renderAllApps === 'function') renderAllApps();
}

function toggleLanguage() {
  var current = getCurrentLanguage();
  var newLang = current === 'en' ? 'ru' : 'en';
  setLanguage(newLang);
}

// ==========================================
// ПОЛУЧЕНИЕ ПОЛНОГО ПРОМПТА ДЛЯ РЕДАКТИРОВАНИЯ
// ==========================================

function getEditPrompt() {
  return getPrompt() + t('editInstruction');
}