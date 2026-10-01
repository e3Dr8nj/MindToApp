const REGISTRY_URL = 'https://e3dr8nj.github.io/MindToApp/registry/registry.json';

let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');
let customModules = JSON.parse(localStorage.getItem('customModules') || '[]');
let currentTab = 'url';
let selectedLocalFile = null;
let selectedFolderFiles = null;
const activeVirtualFS = new Map();

const $ = (id) => document.getElementById(id);

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

let currentEditingModule = null;

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

// 🆕 Утилита: загрузка HTML-кода с URL
async function loadContentFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Ошибка загрузки кода с URL:', url, error);
    return null;
  }
}

// 🆕 Утилита: сохранение content обратно в customModules и localStorage
function saveContentToCustomModule(moduleId, content) {
  const idx = customModules.findIndex(m => m.id === moduleId);
  if (idx !== -1) {
    customModules[idx].content = content;
    localStorage.setItem('customModules', JSON.stringify(customModules));
  }
}

async function loadRegistry() {
  try {
    const response = await fetch(REGISTRY_URL);
    const data = await response.json();
    
    // Загружаем модули из registry и СОХРАНЯЕМ их HTML-код как content
    const registryModules = await Promise.all(
      data.modules.map(async (module) => {
        try {
          const htmlResponse = await fetch(module.url);
          if (!htmlResponse.ok) throw new Error(`HTTP ${htmlResponse.status}`);
          const htmlText = await htmlResponse.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          const manifestScript = doc.getElementById('manifest');
          if (manifestScript) {
            return { 
              ...JSON.parse(manifestScript.textContent), 
              url: module.url, 
              content: htmlText, // 🆕 сохраняем код
              isCustom: false, 
              isLocal: false, 
              isFolder: false 
            };
          }
        } catch (error) { console.error('Ошибка загрузки модуля:', module.url, error); }
        return null;
      })
    );
    const validRegistryModules = registryModules.filter(m => m !== null);
    
    // Восстанавливаем одиночные локальные модули
    const restoredLocalModules = [];
    for (const m of customModules.filter(m => m.isLocal && !m.isFolder)) {
      let content = m.content;
      
      // 🆕 МИГРАЦИЯ: если content отсутствует, пытаемся загрузить с URL
      if (!content && m.url) {
        if (m.url.startsWith('blob:')) {
          // blob URL не переживёт перезагрузку — пробуем прочитать
          try {
            const resp = await fetch(m.url);
            if (resp.ok) {
              content = await resp.text();
              saveContentToCustomModule(m.id, content);
            }
          } catch (e) {
            console.warn(`Модуль ${m.id}: blob URL недоступен, модуль потерян`);
            continue; // пропускаем битый модуль
          }
        } else {
          // http(s) URL — загружаем с сервера
          content = await loadContentFromUrl(m.url);
          if (content) {
            saveContentToCustomModule(m.id, content);
          } else {
            console.warn(`Модуль ${m.id}: не удалось загрузить код с ${m.url}`);
            continue;
          }
        }
      }
      
      if (content) {
        const blob = new Blob([content], { type: 'text/html' });
        restoredLocalModules.push({
          id: m.id,
          name: m.name,
          icon: m.icon,
          description: m.description,
          content: content,
          url: URL.createObjectURL(blob),
          isCustom: true,
          isLocal: true,
          isFolder: false
        });
      }
    }
    
    // Восстанавливаем папки модулей
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(folderData => {
        const vfs = createVirtualFS(folderData);
        activeVirtualFS.set(folderData.id, vfs);
        return {
          id: folderData.manifest.id,
          name: folderData.manifest.name,
          icon: folderData.manifest.icon,
          description: folderData.manifest.description || 'Папка модуля',
          content: folderData.mainHtml,
          url: vfs.url,
          isCustom: true,
          isLocal: true,
          isFolder: true
        };
      });
    } catch (error) { console.error(error); }
    
    allModules = [...validRegistryModules, ...restoredLocalModules, ...restoredFolderModules];
    
    // 🆕 Удаляем из installedModules те, что не удалось восстановить
    const validIds = new Set(allModules.map(m => m.id));
    const brokenIds = installedModules.filter(id => !validIds.has(id));
    if (brokenIds.length > 0) {
      console.warn('Удалены битые модули из списка установленных:', brokenIds);
      installedModules = installedModules.filter(id => validIds.has(id));
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    
    // Fallback: восстанавливаем только локальные модули
    const restoredLocalModules = [];
    for (const m of customModules.filter(m => m.isLocal && !m.isFolder)) {
      let content = m.content;
      if (!content && m.url && !m.url.startsWith('blob:')) {
        content = await loadContentFromUrl(m.url);
        if (content) saveContentToCustomModule(m.id, content);
      }
      if (content) {
        const blob = new Blob([content], { type: 'text/html' });
        restoredLocalModules.push({ ...m, content, url: URL.createObjectURL(blob), isCustom: true, isLocal: true, isFolder: false });
      }
    }
    
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(folderData => {
        const vfs = createVirtualFS(folderData);
        activeVirtualFS.set(folderData.id, vfs);
        return { ...folderData.manifest, description: folderData.manifest.description || 'Папка модуля', content: folderData.mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
      });
    } catch (e) { console.error(e); }
    
    allModules = [...restoredLocalModules, ...restoredFolderModules];
  }
}

function renderInstalledApps() {
  installedAppsContainer.innerHTML = '';
  if (installedModules.length === 0) {
    emptyState.style.display = 'block';
    installedAppsContainer.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  installedAppsContainer.style.display = 'grid';
  installedModules.forEach(moduleId => {
    const module = allModules.find(m => m.id === moduleId);
    if (module) {
      const card = createAppCard(module, true);
      installedAppsContainer.appendChild(card);
    }
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';
  if (allModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Нет доступных модулей</p>';
    return;
  }
  allModules.forEach(module => {
    const card = createAppCard(module, false);
    allAppsContainer.appendChild(card);
  });
}

function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.innerHTML = `<div class="app-icon">${module.icon}</div><div class="app-name">${module.name}</div><div class="app-description">${module.description}</div>`;
  
  if (!isInstalled) {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.textContent = installedModules.includes(module.id) ? 'Удалить' : 'Установить';
    if (installedModules.includes(module.id)) installBtn.classList.add('installed');
    installBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleInstall(module.id); });
    card.appendChild(installBtn);
  } else {
    card.addEventListener('click', () => openApp(module));
  }
  
  // Кнопка редактирования — для всех модулей, у которых есть content
  if (module.content) {
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      openEditModal(module); 
    });
    card.appendChild(editBtn);
  }
  
  // Кнопка удаления — для пользовательских модулей
  if (module.isCustom) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Удалить модуль';
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); removeCustomModule(module.id); });
    card.appendChild(deleteBtn);
  }
  
  return card;
}

function toggleInstall(moduleId) {
  const index = installedModules.indexOf(moduleId);
  if (index > -1) installedModules.splice(index, 1);
  else installedModules.push(moduleId);
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

async function removeCustomModule(moduleId) {
  if (!confirm('Удалить этот модуль?')) return;
  const module = allModules.find(m => m.id === moduleId);
  if (module && module.isFolder) {
    try {
      await deleteFolderModule(moduleId);
      if (activeVirtualFS.has(moduleId)) { activeVirtualFS.get(moduleId).cleanup(); activeVirtualFS.delete(moduleId); }
    } catch (error) { console.error(error); }
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

// --- СОЗДАНИЕ ПРИЛОЖЕНИЯ ИЗ ТЕКСТА ---
function openCreateModal() {
  if (createModal) {
    createModal.classList.add('active');
    if (generatedCodeInput) generatedCodeInput.value = '';
    if (userIdeaInput) userIdeaInput.value = '';
    if (createStatus) {
      createStatus.textContent = '';
      createStatus.className = 'modal-status';
    }
    updatePromptPreview();
  }
}

function closeCreateModal() {
  if (createModal) createModal.classList.remove('active');
}

function copyPrompt() {
  if (!promptText) return;
  const copyBtn = $('copy-prompt-btn');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptText.value).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Копировать готовый промпт', 2000);
      }
    });
  } else {
    promptText.select();
    document.execCommand('copy');
    if (copyBtn) {
      copyBtn.textContent = '✅ Скопировано!';
      setTimeout(() => copyBtn.textContent = '📋 Копировать готовый промпт', 2000);
    }
  }
}

async function createAppFromText() {
  if (!generatedCodeInput || !createStatus) return;
  const code = generatedCodeInput.value.trim();
  if (!code) {
    createStatus.textContent = '❌ Вставьте HTML-код';
    createStatus.className = 'modal-status error';
    return;
  }
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    createStatus.textContent = '❌ Это не похоже на HTML-код';
    createStatus.className = 'modal-status error';
    return;
  }

  createStatus.textContent = '⏳ Анализ кода...';
  createStatus.className = 'modal-status loading';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest">');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('В manifest не хватает полей id, name или icon');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует');

    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Создано через AI',
      content: code,
      isCustom: true,
      isLocal: true,
      isFolder: false
    };

    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }

    const blob = new Blob([code], { type: 'text/html' });
    allModules.push({ 
      ...manifest, 
      content: code,
      url: URL.createObjectURL(blob), 
      isCustom: true, 
      isLocal: true, 
      isFolder: false 
    });

    createStatus.textContent = '✅ Приложение успешно создано!';
    createStatus.className = 'modal-status success';

    setTimeout(() => {
      closeCreateModal();
      renderInstalledApps();
      renderAllApps();
    }, 800);

  } catch (error) {
    console.error(error);
    createStatus.textContent = `❌ Ошибка: ${error.message}`;
    createStatus.className = 'modal-status error';
  }
}

// --- РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ ---
async function openEditModal(module) {
  if (!editModal) return;
  currentEditingModule = module;
  
  if (editModalTitle) editModalTitle.textContent = `✏️ Редактировать: ${module.name}`;
  if (editPreviewIcon) editPreviewIcon.textContent = module.icon;
  if (editPreviewName) editPreviewName.textContent = module.name;
  if (editPreviewDesc) editPreviewDesc.textContent = module.description || '';
  
  let sourceCode = module.content || '';
  
  // 🆕 Если content нет в памяти — пытаемся загрузить с URL
  if (!sourceCode && module.url) {
    if (editSourceCode) {
      editSourceCode.value = '⏳ Загрузка кода...';
      editSourceCode.style.display = 'block';
    }
    const toggleBtn = $('toggle-code-btn');
    if (toggleBtn) toggleBtn.textContent = '⏳ Загрузка...';
    
    sourceCode = await loadContentFromUrl(module.url);
    
    if (sourceCode) {
      // Сохраняем в модуль и в localStorage (если это custom модуль)
      module.content = sourceCode;
      if (module.isCustom) {
        saveContentToCustomModule(module.id, sourceCode);
      }
    } else {
      sourceCode = `// ⚠️ Не удалось загрузить код приложения.\n// Возможно, оно было создано в старой версии платформы.\n// Попробуйте создать его заново через "✨ Создать приложение".`;
    }
  }
  
  if (editSourceCode) {
    editSourceCode.value = sourceCode;
    editSourceCode.style.display = 'none';
    const toggleBtn = $('toggle-code-btn');
    if (toggleBtn) toggleBtn.textContent = '👁 Показать код приложения';
  }
  
  if (editChangesInput) editChangesInput.value = '';
  if (editNewCodeInput) editNewCodeInput.value = '';
  if (editStatus) {
    editStatus.textContent = '';
    editStatus.className = 'modal-status';
  }
  
  editModal.classList.add('active');
}

function closeEditModal() {
  if (editModal) editModal.classList.remove('active');
  currentEditingModule = null;
}

function toggleCodeVisibility() {
  if (!editSourceCode) return;
  const toggleBtn = $('toggle-code-btn');
  if (editSourceCode.style.display === 'none') {
    editSourceCode.style.display = 'block';
    if (toggleBtn) toggleBtn.textContent = '🙈 Скрыть код';
  } else {
    editSourceCode.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = '👁 Показать код приложения';
  }
}

function generateEditPrompt() {
  if (!currentEditingModule) return '';
  
  const sourceCode = editSourceCode?.value || '';
  const changes = editChangesInput?.value.trim() || '';
  
  if (!changes) return '';
  
  const platformInstruction = `Создай одностраничное веб-приложение в одном файле index.html для платформы MindToApp.

Требования:
- Manifest в <head>: <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>
- ВАЖНО: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности, так как создаётся копия приложения.
- CSS в <style>, JS в <script>, без внешних библиотек
- Адаптивный дизайн: работает на десктопе и мобильных
- body { min-height: calc(100vh - 60px); margin: 0; }
- Без alert/confirm/prompt (заблокированы в iframe)
- Картинки/звуки только в Base64`;

  const fullPrompt = `${platformInstruction}

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

  return fullPrompt;
}

function copyEditPrompt() {
  const prompt = generateEditPrompt();
  const copyBtn = $('copy-edit-prompt-btn');
  
  if (!prompt) {
    if (editStatus) {
      editStatus.textContent = '❌ Сначала опишите, что нужно изменить';
      editStatus.className = 'modal-status error';
    }
    return;
  }
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт для AI', 2000);
      }
      if (editStatus) {
        editStatus.textContent = '✅ Промпт скопирован! Откройте AI, вставьте и дождитесь ответа.';
        editStatus.className = 'modal-status success';
      }
    });
  } else {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = prompt;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    if (copyBtn) {
      copyBtn.textContent = '✅ Скопировано!';
      setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт для AI', 2000);
    }
    if (editStatus) {
      editStatus.textContent = '✅ Промпт скопирован!';
      editStatus.className = 'modal-status success';
    }
  }
}

// Создание копии приложения с новым кодом — ПОЛНОЦЕННОЕ ОТДЕЛЬНОЕ ПРИЛОЖЕНИЕ
async function applyEditChanges() {
  if (!currentEditingModule) return;
  if (!editNewCodeInput || !editStatus) return;
  
  const newCode = editNewCodeInput.value.trim();
  if (!newCode) {
    editStatus.textContent = '❌ Вставьте исправленный HTML-код';
    editStatus.className = 'modal-status error';
    return;
  }
  if (!newCode.includes('<html') && !newCode.includes('<!DOCTYPE')) {
    editStatus.textContent = '❌ Это не похоже на HTML-код';
    editStatus.className = 'modal-status error';
    return;
  }
  
  editStatus.textContent = '⏳ Анализ кода...';
  editStatus.className = 'modal-status loading';
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(newCode, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest">');
    
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) {
      throw new Error('В manifest не хватает полей id, name или icon');
    }
    
    // ID должен отличаться от оригинала (иначе это не копия)
    if (manifest.id === currentEditingModule.id) {
      throw new Error('ID не изменился! Попросите AI сгенерировать новый уникальный ID (добавить 6 случайных цифр).');
    }
    
    // Проверка на уникальность
    if (allModules.some(m => m.id === manifest.id)) {
      throw new Error('Приложение с таким ID уже существует. Попросите AI сгенерировать другой ID.');
    }
    
    // 🆕 Создаём ПОЛНОЦЕННОЕ ОТДЕЛЬНОЕ приложение-копию
    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || `Копия: ${currentEditingModule.name}`,
      content: newCode, // 🆕 сохраняем полный код
      isCustom: true,
      isLocal: true,
      isFolder: false
    };
    
    // 🆕 Добавляем в customModules (сохраняется в localStorage навсегда)
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    
    // 🆕 Автоматически устанавливаем копию
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    
    // 🆕 Создаём отдельный blob URL для копии (независим от оригинала)
    const blob = new Blob([newCode], { type: 'text/html' });
    const copyUrl = URL.createObjectURL(blob);
    
    allModules.push({
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || `Копия: ${currentEditingModule.name}`,
      content: newCode,
      url: copyUrl,
      isCustom: true,
      isLocal: true,
      isFolder: false
    });
    
    editStatus.textContent = `✅ Копия "${manifest.name}" создана как отдельное приложение!`;
    editStatus.className = 'modal-status success';
    
    setTimeout(() => {
      closeEditModal();
      renderInstalledApps();
      renderAllApps();
    }, 1000);
    
  } catch (error) {
    console.error(error);
    editStatus.textContent = `❌ Ошибка: ${error.message}`;
    editStatus.className = 'modal-status error';
  }
}

// --- ОЧИСТКА КЭША ---
async function refreshApp() {
  const btn = $('refresh-btn');
  if (btn) btn.textContent = '⏳';
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    setTimeout(() => { window.location.reload(); }, 500);
  } catch (error) {
    console.error('Ошибка очистки кэша:', error);
    window.location.reload();
  }
}

// --- ДОБАВЛЕНИЕ МОДУЛЯ (URL/ФАЙЛ/ПАПКА) ---
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
  if (modalStatus) {
    modalStatus.textContent = '';
    modalStatus.className = 'modal-status';
  }
  switchTab('url');
}

function closeAddModal() { 
  if (addModal) addModal.classList.remove('active'); 
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  const activeTab = document.querySelector(`.tab[data-tab="${tab}"]`);
  if (activeTab) activeTab.style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab-btn[data-target="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (modalStatus) modalStatus.textContent = '';
}

if (localFileInput) {
  localFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html')) {
      if (modalStatus) { modalStatus.textContent = '❌ Выберите файл .html'; modalStatus.className = 'modal-status error'; }
      selectedLocalFile = null;
      if (selectedFileName) selectedFileName.textContent = '';
      return;
    }
    selectedLocalFile = file;
    if (selectedFileName) selectedFileName.textContent = `✅ Выбран: ${file.name}`;
    if (modalStatus) modalStatus.textContent = '';
  });
}

if (folderInput) {
  folderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const indexFile = files.find(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html');
    if (!indexFile) {
      if (modalStatus) { modalStatus.textContent = '❌ В папке должен быть файл index.html'; modalStatus.className = 'modal-status error'; }
      selectedFolderFiles = null;
      if (selectedFolderInfo) selectedFolderInfo.textContent = '';
      return;
    }
    const rootFolder = indexFile.webkitRelativePath.split('/')[0];
    selectedFolderFiles = files;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (selectedFolderInfo) selectedFolderInfo.textContent = `✅ Папка: ${rootFolder} (${files.length} файлов, ${(totalSize / 1048576).toFixed(2)} МБ)`;
    if (modalStatus) modalStatus.textContent = '';
  });
}

async function addModule() {
  if (currentTab === 'folder') await addFolderModule();
  else if (currentTab === 'local') await addLocalFileModule();
  else await addUrlModule();
}

async function addLocalFileModule() {
  if (!selectedLocalFile) { if (modalStatus) { modalStatus.textContent = '❌ Выберите файл'; modalStatus.className = 'modal-status error'; } return; }
  if (modalStatus) { modalStatus.textContent = '⏳ Чтение файла...'; modalStatus.className = 'modal-status loading'; }
  try {
    const fileText = await selectedLocalFile.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(fileText, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    const newModule = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Локальный модуль', content: fileText, isCustom: true, isLocal: true, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    const blob = new Blob([fileText], { type: 'text/html' });
    allModules.push({ ...manifest, content: fileText, url: URL.createObjectURL(blob), isCustom: true, isLocal: true, isFolder: false });
    if (modalStatus) { modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success'; }
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { if (modalStatus) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; } }
}

async function addFolderModule() {
  if (!selectedFolderFiles || !selectedFolderFiles.length) { if (modalStatus) { modalStatus.textContent = '❌ Выберите папку'; modalStatus.className = 'modal-status error'; } return; }
  if (modalStatus) { modalStatus.textContent = '⏳ Чтение файлов...'; modalStatus.className = 'modal-status loading'; }
  try {
    const indexFile = selectedFolderFiles.find(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html');
    if (!indexFile) throw new Error('index.html не найден');
    const mainHtml = await indexFile.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(mainHtml, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    if (modalStatus) modalStatus.textContent = `⏳ Загрузка ${selectedFolderFiles.length} файлов...`;
    const files = [];
    for (const file of selectedFolderFiles) {
      const parts = file.webkitRelativePath.split('/');
      const relativePath = parts.slice(1).join('/');
      if (parts[parts.length - 1].toLowerCase() === 'index.html' || !relativePath) continue;
      files.push({ path: relativePath, blob: file });
    }
    await saveFolderModule(manifest.id, manifest, files, mainHtml);
    const customEntry = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Папка модуля', isCustom: true, isLocal: true, isFolder: true };
    customModules.push(customEntry);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    const folderData = { id: manifest.id, manifest, files, mainHtml };
    const vfs = createVirtualFS(folderData);
    activeVirtualFS.set(manifest.id, vfs);
    allModules.push({ ...manifest, content: mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true });
    if (modalStatus) { modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success'; }
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { if (modalStatus) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; } }
}

async function addUrlModule() {
  if (!moduleUrlInput || !modalStatus) return;
  let url = moduleUrlInput.value.trim();
  if (!url) { modalStatus.textContent = '❌ Введите URL'; modalStatus.className = 'modal-status error'; return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
  if (!url.endsWith('/') && !url.endsWith('.html')) url += '/';
  modalStatus.textContent = '⏳ Загрузка модуля...'; modalStatus.className = 'modal-status loading';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    // 🆕 Сохраняем content и для URL-модулей
    const newModule = { 
      ...manifest, 
      description: manifest.description || 'Пользовательский модуль', 
      content: htmlText, // 🆕
      url, 
      isCustom: true, 
      isLocal: false, 
      isFolder: false 
    };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    allModules.push(newModule);
    modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success';
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; }
}

// --- СОБЫТИЯ ---
function setupEventListeners() {
  $('open-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('back-to-home-btn')?.addEventListener('click', () => showScreen(homeScreen));
  $('go-to-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('close-app-btn')?.addEventListener('click', closeApp);

  $('create-app-btn')?.addEventListener('click', openCreateModal);
  $('close-create-btn')?.addEventListener('click', closeCreateModal);
  $('cancel-create-btn')?.addEventListener('click', closeCreateModal);
  $('copy-prompt-btn')?.addEventListener('click', copyPrompt);
  $('confirm-create-btn')?.addEventListener('click', createAppFromText);
  createModal?.addEventListener('click', (e) => { if (e.target === createModal) closeCreateModal(); });
  
  userIdeaInput?.addEventListener('input', updatePromptPreview);

  $('refresh-btn')?.addEventListener('click', refreshApp);

  $('close-edit-btn')?.addEventListener('click', closeEditModal);
  $('cancel-edit-btn')?.addEventListener('click', closeEditModal);
  $('toggle-code-btn')?.addEventListener('click', toggleCodeVisibility);
  $('copy-edit-prompt-btn')?.addEventListener('click', copyEditPrompt);
  $('apply-edit-btn')?.addEventListener('click', applyEditChanges);
  editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

  $('add-custom-btn')?.addEventListener('click', openAddModal);
  $('add-custom-btn-store')?.addEventListener('click', openAddModal);
  $('close-modal-btn')?.addEventListener('click', closeAddModal);
  $('cancel-modal-btn')?.addEventListener('click', closeAddModal);
  $('confirm-add-btn')?.addEventListener('click', addModule);
  addModal?.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
  moduleUrlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  $('select-file-btn')?.addEventListener('click', () => localFileInput?.click());
  $('select-folder-btn')?.addEventListener('click', () => folderInput?.click());
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCreateModal(); closeAddModal(); closeEditModal(); }
  });
}

init();