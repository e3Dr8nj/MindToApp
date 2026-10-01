const REGISTRY_URL = 'https://e3dr8nj.github.io/MindToApp/registry/registry.json';

let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');
let customModules = JSON.parse(localStorage.getItem('customModules') || '[]');
let currentTab = 'url';
let selectedLocalFile = null;
let selectedFolderFiles = null;
const activeVirtualFS = new Map();
let currentEditingModule = null;

const $ = (id) => document.getElementById(id);

// DOM-элементы
const homeScreen = $('home-screen');
const storeScreen = $('store-screen');
const appScreen = $('app-screen');
const installedAppsContainer = $('installed-apps');
const allAppsContainer = $('all-apps');
const emptyState = $('empty-state');
const currentAppName = $('current-app-name');
const appFrame = $('app-frame');
const addModal = $('add-modal');
const moduleUrlInput = $('module-url-input');
const modalStatus = $('modal-status');
const localFileInput = $('local-file-input');
const selectedFileName = $('selected-file-name');
const folderInput = $('folder-input');
const selectedFolderInfo = $('selected-folder-info');
const createModal = $('create-modal');
const generatedCodeInput = $('generated-code-input');
const createStatus = $('create-status');
const userIdeaInput = $('user-idea-input');
const promptText = $('prompt-text');
const editModal = $('edit-modal');
const editModalTitle = $('edit-modal-title');
const editPreviewIcon = $('edit-preview-icon');
const editPreviewName = $('edit-preview-name');
const editPreviewDesc = $('edit-preview-desc');
const editSourceCode = $('edit-source-code');
const editChangesInput = $('edit-changes-input');
const editNewCodeInput = $('edit-new-code-input');
const editStatus = $('edit-status');

const BASE_PROMPT = `Создай одностраничное веб-приложение в одном файле index.html для платформы MindToApp.

Требования:
- Manifest в <head>: <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>
- ВАЖНО: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
- CSS в <style>, JS в <script>, без внешних библиотек
- Адаптивный дизайн: работает на десктопе и мобильных
- body { min-height: calc(100vh - 60px); margin: 0; }
- Без alert/confirm/prompt (заблокированы в iframe)
- Картинки/звуки только в Base64

Задача: `;

// ===================== УТИЛИТЫ =====================

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}

function closeModal(modalElement) {
  if (modalElement) modalElement.classList.remove('active');
}

function parseAndValidateManifest(code) {
  const doc = new DOMParser().parseFromString(code, 'text/html');
  const script = doc.getElementById('manifest');
  if (!script) throw new Error('Не найден тег <script id="manifest">');
  const manifest = JSON.parse(script.textContent);
  if (!manifest.id || !manifest.name || !manifest.icon) {
    throw new Error('В manifest не хватает полей id, name или icon');
  }
  return manifest;
}

async function loadContentFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Ошибка загрузки кода:', url, error);
    return null;
  }
}

function saveContentToCustomModule(moduleId, content) {
  const idx = customModules.findIndex(m => m.id === moduleId);
  if (idx !== -1) {
    customModules[idx].content = content;
    localStorage.setItem('customModules', JSON.stringify(customModules));
  }
}

function registerModule(manifest, content, options = {}) {
  const module = {
    ...manifest,
    content,
    url: options.url || URL.createObjectURL(new Blob([content], { type: 'text/html' })),
    isCustom: true,
    isLocal: options.isLocal !== undefined ? options.isLocal : true,
    isFolder: options.isFolder || false,
    description: manifest.description || options.defaultDescription || 'Модуль'
  };
  customModules.push(module);
  localStorage.setItem('customModules', JSON.stringify(customModules));
  if (!installedModules.includes(manifest.id)) {
    installedModules.push(manifest.id);
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }
  allModules.push(module);
  return module;
}

// ===================== ИНИЦИАЛИЗАЦИЯ =====================

async function init() {
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  updatePromptPreview();
}

function updatePromptPreview() {
  if (!promptText) return;
  const userIdea = userIdeaInput?.value.trim() || '[опиши здесь функционал и дизайн приложения]';
  promptText.value = BASE_PROMPT + userIdea;
}

// ===================== ЗАГРУЗКА МОДУЛЕЙ =====================

async function loadRegistryModules() {
  const response = await fetch(REGISTRY_URL);
  const data = await response.json();
  const modules = await Promise.all(
    data.modules.map(async (module) => {
      try {
        const htmlText = await (await fetch(module.url)).text();
        const manifest = parseAndValidateManifest(htmlText);
        return { ...manifest, url: module.url, content: htmlText, isCustom: false, isLocal: false, isFolder: false };
      } catch (error) {
        console.error('Ошибка загрузки модуля:', module.url, error);
        return null;
      }
    })
  );
  return modules.filter(m => m !== null);
}

async function restoreLocalModules() {
  const result = [];
  for (const m of customModules.filter(m => m.isLocal && !m.isFolder)) {
    let content = m.content;
    if (!content && m.url) {
      if (m.url.startsWith('blob:')) {
        try {
          const resp = await fetch(m.url);
          if (resp.ok) { content = await resp.text(); saveContentToCustomModule(m.id, content); }
        } catch (e) { console.warn(`Модуль ${m.id}: blob URL недоступен`); continue; }
      } else {
        content = await loadContentFromUrl(m.url);
        if (content) saveContentToCustomModule(m.id, content);
        else { console.warn(`Модуль ${m.id}: не удалось загрузить`); continue; }
      }
    }
    if (content) {
      result.push({ id: m.id, name: m.name, icon: m.icon, description: m.description, content, url: URL.createObjectURL(new Blob([content], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
    }
  }
  return result;
}

async function restoreFolderModules() {
  try {
    const folderData = await getAllFolderModules();
    return folderData.map(fd => {
      const vfs = createVirtualFS(fd);
      activeVirtualFS.set(fd.id, vfs);
      return { id: fd.manifest.id, name: fd.manifest.name, icon: fd.manifest.icon, description: fd.manifest.description || 'Папка модуля', content: fd.mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
    });
  } catch (error) {
    console.error('Ошибка восстановления папок:', error);
    return [];
  }
}

function cleanupBrokenModules() {
  const validIds = new Set(allModules.map(m => m.id));
  const broken = installedModules.filter(id => !validIds.has(id));
  if (broken.length > 0) {
    console.warn('Удалены битые модули:', broken);
    installedModules = installedModules.filter(id => validIds.has(id));
    localStorage.setItem('installedModules', JSON.stringify(installedModules));
  }
}

async function loadRegistry() {
  try {
    const [registry, local, folders] = await Promise.all([
      loadRegistryModules(),
      restoreLocalModules(),
      restoreFolderModules()
    ]);
    allModules = [...registry, ...local, ...folders];
    cleanupBrokenModules();
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    const [local, folders] = await Promise.all([restoreLocalModules(), restoreFolderModules()]);
    allModules = [...local, ...folders];
  }
}

// ===================== РЕНДЕР =====================

function renderInstalledApps() {
  installedAppsContainer.innerHTML = '';
  if (installedModules.length === 0) {
    emptyState.style.display = 'block';
    installedAppsContainer.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  installedAppsContainer.style.display = 'grid';
  installedModules.forEach(id => {
    const module = allModules.find(m => m.id === id);
    if (module) installedAppsContainer.appendChild(createAppCard(module, true));
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';
  if (allModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Нет доступных модулей</p>';
    return;
  }
  allModules.forEach(module => allAppsContainer.appendChild(createAppCard(module, false)));
}

function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.innerHTML = `<div class="app-icon">${module.icon}</div><div class="app-name">${module.name}</div><div class="app-description">${module.description}</div>`;

  if (!isInstalled) {
    const btn = document.createElement('button');
    btn.className = 'install-btn' + (installedModules.includes(module.id) ? ' installed' : '');
    btn.textContent = installedModules.includes(module.id) ? 'Удалить' : 'Установить';
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleInstall(module.id); });
    card.appendChild(btn);
  } else {
    card.addEventListener('click', () => openApp(module));
  }

  if (module.content) {
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(module); });
    card.appendChild(editBtn);
  }

  if (module.isCustom) {
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Удалить модуль';
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeCustomModule(module.id); });
    card.appendChild(delBtn);
  }

  return card;
}

// ===================== ДЕЙСТВИЯ =====================

function toggleInstall(moduleId) {
  const idx = installedModules.indexOf(moduleId);
  if (idx > -1) installedModules.splice(idx, 1);
  else installedModules.push(moduleId);
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

async function removeCustomModule(moduleId) {
  if (!confirm('Удалить этот модуль?')) return;
  const module = allModules.find(m => m.id === moduleId);
  if (module?.isFolder) {
    try {
      await deleteFolderModule(moduleId);
      if (activeVirtualFS.has(moduleId)) { activeVirtualFS.get(moduleId).cleanup(); activeVirtualFS.delete(moduleId); }
    } catch (e) { console.error(e); }
  }
  customModules = customModules.filter(m => m.id !== moduleId);
  installedModules = installedModules.filter(id => id !== moduleId);
  localStorage.setItem('customModules', JSON.stringify(customModules));
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  allModules = allModules.filter(m => m.id !== moduleId);
  renderInstalledApps();
  renderAllApps();
}

function openApp(module) {
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
}

function closeApp() {
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
}

function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ===================== СОЗДАНИЕ ПРИЛОЖЕНИЯ =====================

function openCreateModal() {
  if (!createModal) return;
  createModal.classList.add('active');
  if (generatedCodeInput) generatedCodeInput.value = '';
  if (userIdeaInput) userIdeaInput.value = '';
  showStatus(createStatus, '');
  updatePromptPreview();
}

function copyPrompt() {
  if (!promptText) return;
  const btn = $('copy-prompt-btn');
  const doCopy = () => {
    if (btn) { btn.textContent = '✅ Скопировано!'; setTimeout(() => btn.textContent = '📋 Копировать готовый промпт', 2000); }
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(promptText.value).then(doCopy);
  } else {
    promptText.select();
    document.execCommand('copy');
    doCopy();
  }
}

async function createAppFromText() {
  const code = generatedCodeInput?.value.trim();
  if (!code) return showStatus(createStatus, '❌ Вставьте HTML-код', 'error');
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) return showStatus(createStatus, '❌ Это не похоже на HTML-код', 'error');

  showStatus(createStatus, '⏳ Анализ кода...', 'loading');
  try {
    const manifest = parseAndValidateManifest(code);
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует');
    registerModule(manifest, code, { defaultDescription: 'Создано через AI' });
    showStatus(createStatus, '✅ Приложение успешно создано!', 'success');
    setTimeout(() => { closeModal(createModal); renderInstalledApps(); renderAllApps(); }, 800);
  } catch (error) {
    showStatus(createStatus, `❌ Ошибка: ${error.message}`, 'error');
  }
}

// ===================== РЕДАКТИРОВАНИЕ =====================

async function openEditModal(module) {
  if (!editModal) return;
  currentEditingModule = module;

  if (editModalTitle) editModalTitle.textContent = `✏️ Редактировать: ${module.name}`;
  if (editPreviewIcon) editPreviewIcon.textContent = module.icon;
  if (editPreviewName) editPreviewName.textContent = module.name;
  if (editPreviewDesc) editPreviewDesc.textContent = module.description || '';

  let sourceCode = module.content || '';
  if (!sourceCode && module.url) {
    if (editSourceCode) { editSourceCode.value = '⏳ Загрузка кода...'; editSourceCode.style.display = 'block'; }
    sourceCode = await loadContentFromUrl(module.url);
    if (sourceCode) {
      module.content = sourceCode;
      if (module.isCustom) saveContentToCustomModule(module.id, sourceCode);
    } else {
      sourceCode = '// ⚠️ Не удалось загрузить код. Попробуйте создать приложение заново.';
    }
  }

  if (editSourceCode) { editSourceCode.value = sourceCode; editSourceCode.style.display = 'none'; }
  const toggleBtn = $('toggle-code-btn');
  if (toggleBtn) toggleBtn.textContent = '👁 Показать код приложения';
  if (editChangesInput) editChangesInput.value = '';
  if (editNewCodeInput) editNewCodeInput.value = '';
  showStatus(editStatus, '');
  editModal.classList.add('active');
}

function toggleCodeVisibility() {
  if (!editSourceCode) return;
  const btn = $('toggle-code-btn');
  const isHidden = editSourceCode.style.display === 'none';
  editSourceCode.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.textContent = isHidden ? '🙈 Скрыть код' : '👁 Показать код приложения';
}

function generateEditPrompt() {
  const sourceCode = editSourceCode?.value || '';
  const changes = editChangesInput?.value.trim() || '';
  if (!changes) return '';

  return `Создай одностраничное веб-приложение в одном файле index.html для платформы MindToApp.

Требования:
- Manifest в <head>: <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>
- ВАЖНО: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности, так как создаётся копия приложения.
- CSS в <style>, JS в <script>, без внешних библиотек
- Адаптивный дизайн: работает на десктопе и мобильных
- body { min-height: calc(100vh - 60px); margin: 0; }
- Без alert/confirm/prompt (заблокированы в iframe)
- Картинки/звуки только в Base64

ЗАДАЧА: Модифицируй существующий HTML-код приложения согласно запросу пользователя.

=== СУЩЕСТВУЮЩИЙ КОД ПРИЛОЖЕНИЯ ===
${sourceCode}
=== КОНЕЦ КОДА ===

ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
${changes}

ВАЖНЫЕ ПРАВИЛА:
- Верни ТОЛЬКО полный обновлённый HTML-код, без объяснений и комментариев
- ОБЯЗАТЕЛЬНО сгенерируй НОВОЕ уникальное значение "id" в manifest (добавь 6 случайных цифр к исходному ID)
- Сохрани name, icon, description или обнови их, если пользователь об этом просил
- Сохрани всю существующую функциональность, если пользователь не просил её изменить
- Убедись, что код полностью рабочий и самодостаточный`;
}

function copyEditPrompt() {
  const prompt = generateEditPrompt();
  if (!prompt) return showStatus(editStatus, '❌ Сначала опишите, что нужно изменить', 'error');

  const btn = $('copy-edit-prompt-btn');
  const doCopy = () => {
    if (btn) { btn.textContent = '✅ Скопировано!'; setTimeout(() => btn.textContent = '📋 Скопировать промпт для AI', 2000); }
    showStatus(editStatus, '✅ Промпт скопирован! Откройте AI, вставьте и дождитесь ответа.', 'success');
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(prompt).then(doCopy);
  } else {
    const ta = document.createElement('textarea');
    ta.value = prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    doCopy();
  }
}

async function applyEditChanges() {
  const newCode = editNewCodeInput?.value.trim();
  if (!newCode) return showStatus(editStatus, '❌ Вставьте исправленный HTML-код', 'error');
  if (!newCode.includes('<html') && !newCode.includes('<!DOCTYPE')) return showStatus(editStatus, '❌ Это не похоже на HTML-код', 'error');

  showStatus(editStatus, '⏳ Анализ кода...', 'loading');
  try {
    const manifest = parseAndValidateManifest(newCode);
    if (manifest.id === currentEditingModule.id) throw new Error('ID не изменился! Попросите AI сгенерировать новый уникальный ID (добавить 6 случайных цифр).');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует. Попросите AI сгенерировать другой ID.');
    registerModule(manifest, newCode, { defaultDescription: `Копия: ${currentEditingModule.name}` });
    showStatus(editStatus, `✅ Копия "${manifest.name}" создана как отдельное приложение!`, 'success');
    setTimeout(() => { closeModal(editModal); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) {
    showStatus(editStatus, `❌ Ошибка: ${error.message}`, 'error');
  }
}

// ===================== ОЧИСТКА КЭША =====================

async function refreshApp() {
  const btn = $('refresh-btn');
  if (btn) btn.textContent = '⏳';
  try {
    if ('caches' in window) { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); }
    if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); }
    setTimeout(() => window.location.reload(), 500);
  } catch (e) { window.location.reload(); }
}

// ===================== ДОБАВЛЕНИЕ МОДУЛЯ =====================

function openAddModal() {
  if (!addModal) return;
  addModal.classList.add('active');
  if (moduleUrlInput) moduleUrlInput.value = '';
  selectedLocalFile = null;
  if (selectedFileName) selectedFileName.textContent = '';
  if (localFileInput) localFileInput.value = '';
  selectedFolderFiles = null;
  if (selectedFolderInfo) selectedFolderInfo.textContent = '';
  if (folderInput) folderInput.value = '';
  showStatus(modalStatus, '');
  switchTab('url');
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.querySelector(`.tab[data-tab="${tab}"]`)?.style.setProperty('display', 'block');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-target="${tab}"]`)?.classList.add('active');
  showStatus(modalStatus, '');
}

async function addModule() {
  if (currentTab === 'folder') await addFolderModule();
  else if (currentTab === 'local') await addLocalFileModule();
  else await addUrlModule();
}

async function addLocalFileModule() {
  if (!selectedLocalFile) return showStatus(modalStatus, '❌ Выберите файл', 'error');
  showStatus(modalStatus, '⏳ Чтение файла...', 'loading');
  try {
    const fileText = await selectedLocalFile.text();
    const manifest = parseAndValidateManifest(fileText);
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    registerModule(manifest, fileText, { defaultDescription: 'Локальный модуль' });
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeModal(addModal); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

async function addFolderModule() {
  if (!selectedFolderFiles?.length) return showStatus(modalStatus, '❌ Выберите папку', 'error');
  showStatus(modalStatus, '⏳ Чтение файлов...', 'loading');
  try {
    const indexFile = selectedFolderFiles.find(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html');
    if (!indexFile) throw new Error('index.html не найден');
    const mainHtml = await indexFile.text();
    const manifest = parseAndValidateManifest(mainHtml);
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    showStatus(modalStatus, `⏳ Загрузка ${selectedFolderFiles.length} файлов...`);
    const files = [];
    for (const file of selectedFolderFiles) {
      const parts = file.webkitRelativePath.split('/');
      const rel = parts.slice(1).join('/');
      if (parts[parts.length - 1].toLowerCase() !== 'index.html' && rel) files.push({ path: rel, blob: file });
    }
    await saveFolderModule(manifest.id, manifest, files, mainHtml);
    const vfs = createVirtualFS({ id: manifest.id, manifest, files, mainHtml });
    activeVirtualFS.set(manifest.id, vfs);
    registerModule(manifest, mainHtml, { url: vfs.url, isFolder: true, defaultDescription: 'Папка модуля' });
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeModal(addModal); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

async function addUrlModule() {
  let url = moduleUrlInput?.value.trim();
  if (!url) return showStatus(modalStatus, '❌ Введите URL', 'error');
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
  if (!url.endsWith('/') && !url.endsWith('.html')) url += '/';
  showStatus(modalStatus, '⏳ Загрузка модуля...', 'loading');
  try {
    const htmlText = await (await fetch(url)).text();
    const manifest = parseAndValidateManifest(htmlText);
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    registerModule(manifest, htmlText, { url, isLocal: false, defaultDescription: 'Пользовательский модуль' });
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeModal(addModal); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

// ===================== СОБЫТИЯ =====================

function setupEventListeners() {
  $('open-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('back-to-home-btn')?.addEventListener('click', () => showScreen(homeScreen));
  $('go-to-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('close-app-btn')?.addEventListener('click', closeApp);

  $('create-app-btn')?.addEventListener('click', openCreateModal);
  $('close-create-btn')?.addEventListener('click', () => closeModal(createModal));
  $('cancel-create-btn')?.addEventListener('click', () => closeModal(createModal));
  $('copy-prompt-btn')?.addEventListener('click', copyPrompt);
  $('confirm-create-btn')?.addEventListener('click', createAppFromText);
  createModal?.addEventListener('click', (e) => { if (e.target === createModal) closeModal(createModal); });

  userIdeaInput?.addEventListener('input', updatePromptPreview);
  $('refresh-btn')?.addEventListener('click', refreshApp);

  $('close-edit-btn')?.addEventListener('click', () => closeModal(editModal));
  $('cancel-edit-btn')?.addEventListener('click', () => closeModal(editModal));
  $('toggle-code-btn')?.addEventListener('click', toggleCodeVisibility);
  $('copy-edit-prompt-btn')?.addEventListener('click', copyEditPrompt);
  $('apply-edit-btn')?.addEventListener('click', applyEditChanges);
  editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeModal(editModal); });

  $('add-custom-btn')?.addEventListener('click', openAddModal);
  $('add-custom-btn-store')?.addEventListener('click', openAddModal);
  $('close-modal-btn')?.addEventListener('click', () => closeModal(addModal));
  $('cancel-modal-btn')?.addEventListener('click', () => closeModal(addModal));
  $('confirm-add-btn')?.addEventListener('click', addModule);
  addModal?.addEventListener('click', (e) => { if (e.target === addModal) closeModal(addModal); });
  moduleUrlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  $('select-file-btn')?.addEventListener('click', () => localFileInput?.click());
  $('select-folder-btn')?.addEventListener('click', () => folderInput?.click());

  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.target)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(createModal); closeModal(addModal); closeModal(editModal); } });

  localFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html')) {
      showStatus(modalStatus, '❌ Выберите файл .html', 'error');
      selectedLocalFile = null;
      if (selectedFileName) selectedFileName.textContent = '';
      return;
    }
    selectedLocalFile = file;
    if (selectedFileName) selectedFileName.textContent = `✅ Выбран: ${file.name}`;
    showStatus(modalStatus, '');
  });

  folderInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const idx = files.find(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html');
    if (!idx) {
      showStatus(modalStatus, '❌ В папке должен быть файл index.html', 'error');
      selectedFolderFiles = null;
      if (selectedFolderInfo) selectedFolderInfo.textContent = '';
      return;
    }
    selectedFolderFiles = files;
    const root = idx.webkitRelativePath.split('/')[0];
    const size = (files.reduce((s, f) => s + f.size, 0) / 1048576).toFixed(2);
    if (selectedFolderInfo) selectedFolderInfo.textContent = `✅ Папка: ${root} (${files.length} файлов, ${size} МБ)`;
    showStatus(modalStatus, '');
  });
}

init();