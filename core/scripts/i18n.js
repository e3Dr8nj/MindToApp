// ==========================================
// СИСТЕМА ЛОКАЛИЗАЦИИ (i18n)
// ==========================================

const translations = {
  en: {
    promptText: [
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

    // === Навигация и заголовки ===
    myApps: '🏠 My Apps',
    store: '📦 Store',
    themes: '🎨 Themes',
    ai: '🤖 AI',
    promptBtn: '⚙️ Prompt',
    builder: '🛠 Builder',
    add: '➕ Add',
    exportUrls: '📤 Export URLs',
    refresh: '🔄',
    languageToggle: 'EN',
    languageToggleTitle: 'Switch to Russian',

    // === Сайдбар ===
    prompt: '📋 prompt',
    create: '🚀 Create',
    url: '🔗 URL',

    // === Конструктор ===
    builderTitle: '🛠 App Builder',
    builderCloseTitle: 'Close',
    describeIdea: '💡 Describe your idea',
    describeIdeaDesc: 'Describe the app you want to create. The more details — the better the result.',
    describeIdeaPlaceholder: 'For example: Expense calculator with charts, dark theme, and history saved in localStorage...',
    copyPrompt: '📋 Copy prompt',
    sendToAI: '🤖 Send to AI',
    sendToAIDesc: 'Paste the copied prompt into any AI and wait for the response.',
    openAI: '🌐 Open AI',
    afterResponse: 'After receiving the response, copy the entire HTML code.',
    createApp: '🚀 Create app',
    createAppDesc: 'Paste the HTML code returned by AI and click "Create".',
    codeInputPlaceholder: 'Paste the entire HTML code from AI here...',

    // === Старая модалка создания ===
    createModalTitle: '✨ Create app with AI',
    createStep1: '1. Describe your idea:',
    createStep2: '2. Ready prompt (updates automatically):',
    createCopyPrompt: '📋 1. Copy prompt',
    createStep3: '3. Paste prompt into AI:',
    createStep3Desc: 'Open the link, paste the prompt, wait for response and copy HTML code.',
    createStep4: '4. Paste the received HTML code:',
    createStep4Placeholder: 'Paste the entire index.html code here...',
    cancel: 'Cancel',
    createAppBtn: '🚀 Create app',

    // === Склад ===
    storeEmpty: 'Store is empty',
    install: 'Install',
    noInstalledApps: "You don't have any installed apps yet",
    goToStore: 'Go to store',

    // === Экран приложения ===
    application: 'Application',

    // === Буфер обмена ===
    clipboard: '📋 Clipboard',
    clipboardEmpty: '📋 Clipboard is empty',
    clipboardEmptyDesc: 'Copy text or link and press the button again',

    // === Модалка добавления модуля ===
    addModuleTitle: '➕ Add module',
    addTabLink: '🔗 Link',
    addTabFile: '📄 File',
    addTabFolder: '📁 Folder',
    addTabCode: '📋 Code',
    addUrlDesc: 'Paste a direct link to the HTML file or folder.<br>Supported: <code>.html</code>, <code>.txt</code>, GitHub Gist (Raw), GitHub Pages.',
    addUrlPlaceholder: 'https://example.com/module/',
    addFileDesc: 'Select <b>one .html file</b> from your computer.',
    addSelectFile: '📂 Select .html file',
    addFolderDesc: 'Select a <b>folder</b> with the module (must have index.html).',
    addSelectFolder: '📁 Select folder',
    addFolderWarning: '⚠️ Works in Chrome, Edge, Firefox. Doesn\'t work in Safari.',
    addCodeDesc: 'Paste the full HTML code of the app. Code must contain <code>&lt;script id="manifest"&gt;</code> in <code>&lt;head&gt;</code>.',
    addCodePlaceholder: 'Paste the app HTML code here...',
    addBtn: 'Add',

    // === Модалка редактирования ===
    editTitle: '✏️ Edit',
    editName: 'Name',
    editDescription: 'Description',
    editShowCode: '👁 Show code',
    editCopyCode: '📋 Copy code',
    editCopyPromptCode: '📋 Copy prompt + code for AI',
    close: 'Close',

    // === Модалка шеринга ===
    shareTitle: '📤 Share app',
    shareStep1: '📋 Step 1: Copy code',
    shareStep1Desc: 'Copy the entire HTML code of the app to clipboard.',
    shareCopyCode: '📋 Copy code',
    shareStep2: '🌐 Step 2: Host and get link',
    shareStep2Desc: 'Open a service, paste the code, save it, and copy the link.',
    shareStep3: '🔗 Step 3: Bind link to app',
    shareStep3Desc: 'Paste the link to the hosted app. It will be saved and available for export.',
    shareUrlPlaceholder: 'https://...',
    bindUrl: '🔗 Bind link',
    unbindUrl: '✂️ Unbind',

    // === Модалка тем ===
    themesTitle: '🎨 Manage themes',
    themesSystemTitle: 'System themes',
    themesCustomTitle: 'Custom themes',
    themesApply: 'Apply',
    themesNoCustom: 'No custom themes yet',
    themesAddCustom: '➕ Add custom theme',

    // === Модалка добавления темы ===
    addThemeTitle: '➕ Add custom theme',
    themeStep1: '1. Copy theme template',
    themeStep1Desc: 'Copy the template below and send it to AI.',
    themeCopyTemplate: '📋 Copy template',
    themeStep2: '2. Send template to AI',
    themeStep2Desc: 'Paste the template into AI and describe what theme you want (colors, style, mood, etc.).',
    themeStep3: '3. Paste the result',
    themeStep3Desc: 'Paste the CSS code generated by AI.',
    themeNamePlaceholder: 'Theme name (e.g., Green Neon)',
    themeCssPlaceholder: 'Paste the CSS code from AI here...',
    addThemeBtn: 'Add theme',

    // === Модалка промпта ===
    promptEditorTitle: '⚙️ Prompt editor',
    promptEditorDesc: 'This prompt is used when creating and editing apps. Change it to customize AI behavior.',
    resetToDefault: '🔄 Reset to default',
    saveChanges: '💾 Save changes',

    // === Модалка AI менеджера ===
    aiListTitle: '🤖 AI list',
    aiListDesc: 'Order in list = order in menu.',
    aiYourAI: 'Your AI',
    newAI: '➕ New AI',
    aiEditName: 'Name',
    aiEditUrl: 'URL',
    aiNamePlaceholder: 'For example: Qwen Chat',
    aiUrlPlaceholder: 'https://chat.qwenlm.ai',
    save: '💾 Save',
    addAI: '➕ Add AI',
    resetList: '🔄 Reset list',

    // === Модалка информации о приложении ===
    appInfoTitle: 'Application',

    // === Модалка экспорта ссылок ===
    exportUrlsTitle: '📤 Export URLs',
    exportDesc: 'List of apps from "My Apps" with bound links.',
    noLinkedApps: '📭 No apps with bound links',
    noLinkedAppsDesc: 'Bind links via the "📤" button on app cards.',
    copyList: '📋 Copy list',

    // === Меню карточки ===
    info: 'ℹ️ Info',
    open: '🚀 Open',
    edit: '✏️ Edit',
    share: '📤 Share',
    delete: '🗑 Delete',
    settings: 'Settings',
    noDescription: 'No description',
    linkedUrl: '🔗 Linked URL:',

    // === Уведомления ===
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
    deleteTheme: 'Delete this theme?',
    themeAdded: '✅ Theme added!',
    themeNameRequired: '❌ Enter theme name',
    themeCssRequired: '❌ Paste CSS code',
    themeCssInvalid: '❌ CSS must contain :root block',
    templateCopied: '✅ Theme template copied!',
    noAiNetworks: 'No AI networks configured',
    aiNotLoaded: 'AI networks not loaded',
    noCustomThemes: 'No custom themes yet',

    // === Подсказки ===
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
    promptText: [
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

    // === Навигация и заголовки ===
    myApps: '🏠 Мои приложения',
    store: '📦 Склад',
    themes: '🎨 Темы',
    ai: '🤖 ИИ',
    promptBtn: '⚙️ Промпт',
    builder: '🛠 Конструктор',
    add: '➕ Добавить',
    exportUrls: '📤 Экспорт ссылок',
    refresh: '🔄',
    languageToggle: 'RU',
    languageToggleTitle: 'Переключить на английский',

    // === Сайдбар ===
    prompt: '📋 prompt',
    create: '🚀 Создать',
    url: '🔗 URL',

    // === Конструктор ===
    builderTitle: '🛠 Конструктор приложений',
    builderCloseTitle: 'Закрыть',
    describeIdea: '💡 Опишите идею',
    describeIdeaDesc: 'Опишите, какое приложение вы хотите создать. Чем подробнее — тем лучше результат.',
    describeIdeaPlaceholder: 'Например: Калькулятор расходов с графиками, тёмной темой и сохранением истории в localStorage...',
    copyPrompt: '📋 Скопировать промпт',
    sendToAI: '🤖 Отправьте в нейросеть',
    sendToAIDesc: 'Вставьте скопированный промпт в любую нейросеть и дождитесь ответа.',
    openAI: '🌐 Открыть нейросеть',
    afterResponse: 'После получения ответа скопируйте весь HTML-код.',
    createApp: '🚀 Создайте приложение',
    createAppDesc: 'Вставьте HTML-код, который вернула нейросеть, и нажмите "Создать".',
    codeInputPlaceholder: 'Вставьте сюда весь HTML-код от нейросети...',

    // === Старая модалка создания ===
    createModalTitle: '✨ Создать приложение с ИИ',
    createStep1: '1. Опишите свою идею:',
    createStep2: '2. Готовый промпт (обновляется автоматически):',
    createCopyPrompt: '📋 1. Скопировать промпт',
    createStep3: '3. Вставьте промпт в нейросеть:',
    createStep3Desc: 'Откройте ссылку, вставьте промпт, дождитесь ответа и скопируйте HTML-код.',
    createStep4: '4. Вставьте полученный HTML-код:',
    createStep4Placeholder: 'Вставьте сюда весь код index.html...',
    cancel: 'Отмена',
    createAppBtn: '🚀 Создать приложение',

    // === Склад ===
    storeEmpty: 'Склад пуст',
    install: 'Установить',
    noInstalledApps: 'У вас пока нет установленных приложений',
    goToStore: 'Перейти на склад',

    // === Экран приложения ===
    application: 'Приложение',

    // === Буфер обмена ===
    clipboard: '📋 Буфер обмена',
    clipboardEmpty: '📋 Буфер обмена пуст',
    clipboardEmptyDesc: 'Скопируйте текст или ссылку и нажмите кнопку снова',

    // === Модалка добавления модуля ===
    addModuleTitle: '➕ Добавить модуль',
    addTabLink: '🔗 Ссылка',
    addTabFile: '📄 Файл',
    addTabFolder: '📁 Папка',
    addTabCode: '📋 Код',
    addUrlDesc: 'Вставьте прямую ссылку на файл с HTML-кодом или на папку.<br>Поддерживаются: <code>.html</code>, <code>.txt</code>, GitHub Gist (Raw), GitHub Pages.',
    addUrlPlaceholder: 'https://example.com/module/',
    addFileDesc: 'Выберите <b>один файл .html</b> с вашего компьютера.',
    addSelectFile: '📂 Выбрать файл .html',
    addFolderDesc: 'Выберите <b>папку</b> с модулем (должен быть index.html).',
    addSelectFolder: '📁 Выбрать папку',
    addFolderWarning: '⚠️ Работает в Chrome, Edge, Firefox. Не работает в Safari.',
    addCodeDesc: 'Вставьте полный HTML-код приложения. Код должен содержать <code>&lt;script id="manifest"&gt;</code> в <code>&lt;head&gt;</code>.',
    addCodePlaceholder: 'Вставьте сюда HTML-код приложения...',
    addBtn: 'Добавить',

    // === Модалка редактирования ===
    editTitle: '✏️ Редактировать',
    editName: 'Название',
    editDescription: 'Описание',
    editShowCode: '👁 Показать код',
    editCopyCode: '📋 Копировать код',
    editCopyPromptCode: '📋 Копировать промпт + код для ИИ',
    close: 'Закрыть',

    // === Модалка шеринга ===
    shareTitle: '📤 Поделиться приложением',
    shareStep1: '📋 Шаг 1: Скопировать код',
    shareStep1Desc: 'Скопируйте весь HTML-код приложения в буфер обмена.',
    shareCopyCode: '📋 Скопировать код',
    shareStep2: '🌐 Шаг 2: Разместить и получить ссылку',
    shareStep2Desc: 'Откройте сервис, вставьте код, сохраните и скопируйте ссылку.',
    shareStep3: '🔗 Шаг 3: Привяжите ссылку к приложению',
    shareStep3Desc: 'Вставьте ссылку на размещённое приложение. Она сохранится и будет доступна для экспорта.',
    shareUrlPlaceholder: 'https://...',
    bindUrl: '🔗 Привязать ссылку',
    unbindUrl: '✂️ Отвязать',

    // === Модалка тем ===
    themesTitle: '🎨 Управление темами',
    themesSystemTitle: 'Системные темы',
    themesCustomTitle: 'Пользовательские темы',
    themesApply: 'Применить',
    themesNoCustom: 'Пользовательских тем пока нет',
    themesAddCustom: '➕ Добавить свою тему',

    // === Модалка добавления темы ===
    addThemeTitle: '➕ Добавить свою тему',
    themeStep1: '1. Скопируйте шаблон темы',
    themeStep1Desc: 'Скопируйте шаблон ниже и отправьте его в нейросеть.',
    themeCopyTemplate: '📋 Скопировать шаблон',
    themeStep2: '2. Отправьте шаблон в нейросеть',
    themeStep2Desc: 'Вставьте шаблон в нейросеть и опишите, какую тему вы хотите (цвета, стиль, настроение и т.д.).',
    themeStep3: '3. Вставьте результат',
    themeStep3Desc: 'Вставьте CSS-код, сгенерированный нейросетью.',
    themeNamePlaceholder: 'Название темы (например: Зелёная неон)',
    themeCssPlaceholder: 'Вставьте сюда CSS-код от нейросети...',
    addThemeBtn: 'Добавить тему',

    // === Модалка промпта ===
    promptEditorTitle: '⚙️ Редактор промпта',
    promptEditorDesc: 'Этот промпт используется при создании и редактировании приложений. Измените его, чтобы настроить поведение нейросети.',
    resetToDefault: '🔄 Сбросить к стандартному',
    saveChanges: '💾 Сохранить изменения',

    // === Модалка AI менеджера ===
    aiListTitle: '🤖 Список нейросетей',
    aiListDesc: 'Порядок в списке = порядок в меню.',
    aiYourAI: 'Ваши нейросети',
    newAI: '➕ Новая нейросеть',
    aiEditName: 'Название',
    aiEditUrl: 'Ссылка (URL)',
    aiNamePlaceholder: 'Например: Qwen Chat',
    aiUrlPlaceholder: 'https://chat.qwenlm.ai',
    save: '💾 Сохранить',
    addAI: '➕ Добавить нейросеть',
    resetList: '🔄 Сбросить список',

    // === Модалка информации о приложении ===
    appInfoTitle: 'Приложение',

    // === Модалка экспорта ссылок ===
    exportUrlsTitle: '📤 Экспорт ссылок',
    exportDesc: 'Список приложений из «Мои приложения» с привязанными ссылками.',
    noLinkedApps: '📭 Нет приложений с привязанными ссылками',
    noLinkedAppsDesc: 'Привяжите ссылки через кнопку «📤» на карточках приложений.',
    copyList: '📋 Скопировать список',

    // === Меню карточки ===
    info: 'ℹ️ Информация',
    open: '🚀 Открыть',
    edit: '✏️ Редактировать',
    share: '📤 Поделиться',
    delete: '🗑 Удалить',
    settings: 'Настройки',
    noDescription: 'Нет описания',
    linkedUrl: '🔗 Привязанная ссылка:',

    // === Уведомления ===
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
    deleteTheme: 'Удалить эту тему?',
    themeAdded: '✅ Тема добавлена!',
    themeNameRequired: '❌ Введите название темы',
    themeCssRequired: '❌ Вставьте CSS-код',
    themeCssInvalid: '❌ CSS должен содержать блок :root',
    templateCopied: '✅ Шаблон темы скопирован!',
    noAiNetworks: 'Нейросети не настроены',
    aiNotLoaded: 'Нейросети не загружены',
    noCustomThemes: 'Пользовательских тем пока нет',

    // === Подсказки ===
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

function applyTranslation(el, key, isHtml) {
  var text = t(key);
  var currentText = (isHtml ? el.innerHTML : el.textContent).trim();

  if (currentText && text) {
    var firstChars = text.slice(0, 2);
    if (currentText.startsWith(firstChars)) {
      text = text.slice(firstChars.length).trim();
    }
  }

  if (isHtml) {
    el.innerHTML = text;
  } else {
    el.textContent = text;
  }
}

function applyLanguage() {
  var lang = getCurrentLanguage();

  var textUpdates = [
    // Заголовки экранов
    { selector: '#home-screen > header > h1', key: 'myApps' },
    { selector: '#store-screen > header > h1', key: 'store' },
    { selector: '#clipboard-screen > header > h1', key: 'clipboard' },

    // Кнопки навигации
    { selector: '#open-store-btn', key: 'store' },
    { selector: '#manage-themes-btn', key: 'themes' },
    { selector: '#manage-ai-btn', key: 'ai' },
    { selector: '#edit-prompts-btn', key: 'promptBtn' },
    { selector: '#builder-btn', key: 'builder' },
    { selector: '#add-custom-btn', key: 'add' },
    { selector: '#add-custom-btn-store', key: 'add' },
    { selector: '#export-urls-btn', key: 'exportUrls' },
    { selector: '#go-to-store-btn', key: 'goToStore' },

    // Кнопки "Назад"
    { selector: '#close-app-btn', key: 'back', isHtml: true },
    { selector: '#close-clipboard-screen-btn', key: 'back', isHtml: true },
    { selector: '#back-to-home-btn', key: 'back', isHtml: true },

    // Сайдбар
    { selector: '#sidebar-prompt-btn', key: 'prompt', isHtml: true },
    { selector: '#sidebar-create-btn', key: 'create', isHtml: true },
    { selector: '#sidebar-url-btn', key: 'url', isHtml: true },

    // Конструктор
    { selector: '#builder-panel > .builder-panel-header > h2', key: 'builderTitle' },
    { selector: '#builder-panel .builder-block:nth-child(1) .builder-block-title', key: 'describeIdea' },
    { selector: '#builder-panel .builder-block:nth-child(1) .builder-block-desc', key: 'describeIdeaDesc' },
    { selector: '#builder-copy-prompt-btn', key: 'copyPrompt' },
    { selector: '#builder-panel .builder-block:nth-child(3) .builder-block-title', key: 'sendToAI' },
    { selector: '#builder-panel .builder-block:nth-child(3) .builder-block-desc', key: 'sendToAIDesc' },
    { selector: '#builder-open-ai-btn', key: 'openAI' },
    { selector: '#builder-panel .builder-hint', key: 'afterResponse' },
    { selector: '#builder-panel .builder-block:nth-child(5) .builder-block-title', key: 'createApp' },
    { selector: '#builder-panel .builder-block:nth-child(5) .builder-block-desc', key: 'createAppDesc' },
    { selector: '#builder-create-btn', key: 'createApp' },

    // Пустое состояние
    { selector: '#empty-state > p', key: 'noInstalledApps' },

    // Модалка добавления темы - описания шагов
    { selector: '#add-theme-modal .step-box:nth-child(1) > h3', key: 'themeStep1' },
    { selector: '#add-theme-modal .step-box:nth-child(1) > p', key: 'themeStep1Desc' },
    { selector: '#copy-theme-template-btn', key: 'themeCopyTemplate' },
    { selector: '#add-theme-modal .step-box:nth-child(2) > h3', key: 'themeStep2' },
    { selector: '#add-theme-modal .step-box:nth-child(2) > p', key: 'themeStep2Desc' },
    { selector: '#add-theme-modal .step-box:nth-child(3) > h3', key: 'themeStep3' },
    { selector: '#add-theme-modal .step-box:nth-child(3) > p', key: 'themeStep3Desc' },
    { selector: '#submit-theme-btn', key: 'addThemeBtn' },

    // Модалка тем
    { selector: '#themes-modal .modal-header h2', key: 'themesTitle' },
    { selector: '#themes-modal .step-box:nth-child(1) > h3', key: 'themesSystemTitle' },
    { selector: '#themes-modal .step-box:nth-child(2) > h3', key: 'themesCustomTitle' },
    { selector: '#add-theme-btn', key: 'themesAddCustom' }
  ];

  textUpdates.forEach(function(item) {
    var el = document.querySelector(item.selector);
    if (el) {
      applyTranslation(el, item.key, item.isHtml);
    }
  });

  // Обновляем кнопку переключения языка
  var langBtn = document.getElementById('language-toggle-btn');
  if (langBtn) {
    langBtn.textContent = t('languageToggle');
    langBtn.title = t('languageToggleTitle');
  }

  // Обновляем placeholder'ы
  var placeholders = [
    { selector: '#builder-idea-input', key: 'describeIdeaPlaceholder' },
    { selector: '#builder-code-input', key: 'codeInputPlaceholder' },
    { selector: '#theme-name-input', key: 'themeNamePlaceholder' },
    { selector: '#theme-css-input', key: 'themeCssPlaceholder' },
    { selector: '#ai-edit-name', key: 'aiNamePlaceholder' },
    { selector: '#ai-edit-url', key: 'aiUrlPlaceholder' },
    { selector: '#share-url-input', key: 'shareUrlPlaceholder' },
    { selector: '#module-url-input', key: 'addUrlPlaceholder' }
  ];

  placeholders.forEach(function(item) {
    var el = document.querySelector(item.selector);
    if (el) {
      el.placeholder = t(item.key);
    }
  });

  // Перерисовываем карточки приложений
  if (typeof renderInstalledApps === 'function') renderInstalledApps();
  if (typeof renderAllApps === 'function') renderAllApps();
  if (typeof renderCustomThemesList === 'function') renderCustomThemesList();
}

function toggleLanguage() {
  var current = getCurrentLanguage();
  var newLang = current === 'en' ? 'ru' : 'en';
  setLanguage(newLang);
}