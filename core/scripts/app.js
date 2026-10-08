async function init() {
  initTheme();
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  updatePromptPreview();
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

async function refreshApp() {
  const btn = $('refresh-btn');
  if (btn) btn.textContent = '⏳';
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch (e) { console.error(e); }
  setTimeout(() => window.location.reload(), 500);
}

// ==========================================
// КОНСТРУКТОР ПРИЛОЖЕНИЙ
// ==========================================

const BUILDER_PLATFORM_INSTRUCTION = `

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`;

function openBuilder() {
  const ideaInput = $('builder-idea-input');
  const codeInput = $('builder-code-input');
  const status1 = $('builder-status-1');
  const status3 = $('builder-status-3');
  
  if (ideaInput) ideaInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status1) { status1.textContent = ''; status1.className = 'modal-status'; }
  if (status3) { status3.textContent = ''; status3.className = 'modal-status'; }
  
  showScreen($('builder-screen'));
}

function closeBuilder() {
  showScreen(homeScreen);
}

function copyBuilderPrompt() {
  const ideaInput = $('builder-idea-input');
  const statusEl = $('builder-status-1');
  const copyBtn = $('builder-copy-prompt-btn');
  
  if (!ideaInput) return;
  
  const idea = ideaInput.value.trim();
  if (!idea) {
    showStatus(statusEl, '❌ Сначала опишите идею приложения', 'error');
    return;
  }
  
  const fullPrompt = BASE_PROMPT + idea + BUILDER_PLATFORM_INSTRUCTION;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000);
      }
      showStatus(statusEl, '✅ Промпт скопирован! Теперь вставьте его в нейросеть.', 'success');
    }).catch(() => {
      showStatus(statusEl, '❌ Не удалось скопировать', 'error');
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = fullPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000);
      }
      showStatus(statusEl, '✅ Промпт скопирован! Теперь вставьте его в нейросеть.', 'success');
    } catch (e) {
      showStatus(statusEl, '❌ Не удалось скопировать', 'error');
    }
    document.body.removeChild(textarea);
  }
}

function openSelectedAI() {
  const selectEl = $('builder-ai-select');
  if (!selectEl) return;
  const url = selectEl.value;
  if (url) window.open(url, '_blank');
}

function createFromBuilder() {
  const codeInput = $('builder-code-input');
  const statusEl = $('builder-status-3');
  const createBtn = $('builder-create-btn');
  
  if (!codeInput || !statusEl) return;
  
  const code = codeInput.value.trim();
  if (!code) {
    showStatus(statusEl, '❌ Вставьте HTML-код от нейросети', 'error');
    return;
  }
  
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    showStatus(statusEl, '❌ Это не похоже на HTML-код', 'error');
    return;
  }
  
  showStatus(statusEl, '⏳ Анализ кода...', 'loading');
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest"> в <head>');
    
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('В manifest не хватает полей id, name или icon');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует');
    
    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Создано через конструктор',
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
    
    showStatus(statusEl, '✅ Приложение успешно создано!', 'success');
    
    if (createBtn) {
      createBtn.textContent = '✅ Создано!';
      setTimeout(() => {
        createBtn.textContent = '🚀 Создать приложение';
        closeBuilder();
        renderInstalledApps();
        renderAllApps();
      }, 1000);
    }
  } catch (error) {
    showStatus(statusEl, `❌ Ошибка: ${error.message}`, 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}

// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

function setupEventListeners() {
  // Навигация
  $('open-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('back-to-home-btn')?.addEventListener('click', () => showScreen(homeScreen));
  $('go-to-store-btn')?.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  $('close-app-btn')?.addEventListener('click', closeApp);

  // Тема
  $('theme-toggle-btn')?.addEventListener('click', cycleTheme);

  // Конструктор
  $('builder-btn')?.addEventListener('click', openBuilder);
  $('builder-back-btn')?.addEventListener('click', closeBuilder);
  $('builder-copy-prompt-btn')?.addEventListener('click', copyBuilderPrompt);
  $('builder-open-ai-btn')?.addEventListener('click', openSelectedAI);
  $('builder-create-btn')?.addEventListener('click', createFromBuilder);

  // Создание (старая модалка)
  $('create-app-btn')?.addEventListener('click', openCreateModal);
  $('close-create-btn')?.addEventListener('click', closeCreateModal);
  $('cancel-create-btn')?.addEventListener('click', closeCreateModal);
  $('copy-prompt-btn')?.addEventListener('click', copyPrompt);
  $('confirm-create-btn')?.addEventListener('click', createAppFromText);
  createModal?.addEventListener('click', (e) => { if (e.target === createModal) closeCreateModal(); });
  userIdeaInput?.addEventListener('input', updatePromptPreview);

  // Кэш
  $('refresh-btn')?.addEventListener('click', refreshApp);

  // Редактирование
  $('close-edit-btn')?.addEventListener('click', closeEditModal);
  $('cancel-edit-btn')?.addEventListener('click', closeEditModal);
  $('toggle-code-btn')?.addEventListener('click', toggleCodeVisibility);
  $('copy-edit-prompt-btn')?.addEventListener('click', copyEditPrompt);
  $('apply-edit-btn')?.addEventListener('click', applyEditChanges);
  editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

  // Добавление
  $('add-custom-btn')?.addEventListener('click', openAddModal);
  $('add-custom-btn-store')?.addEventListener('click', openAddModal);
  $('close-modal-btn')?.addEventListener('click', closeAddModal);
  $('cancel-modal-btn')?.addEventListener('click', closeAddModal);
  $('confirm-add-btn')?.addEventListener('click', addModule);
  addModal?.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
  moduleUrlInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  $('select-file-btn')?.addEventListener('click', () => localFileInput?.click());
  $('select-folder-btn')?.addEventListener('click', () => folderInput?.click());

  // Шаринг
  $('close-share-btn')?.addEventListener('click', closeShareModal);
  $('close-share-footer-btn')?.addEventListener('click', closeShareModal);
  $('copy-app-code-btn')?.addEventListener('click', copyAppCode);
  $('open-gist-btn')?.addEventListener('click', openGistWithCode);
  const shareModalEl = $('share-modal');
  if (shareModalEl) {
    shareModalEl.addEventListener('click', (e) => { if (e.target === shareModalEl) closeShareModal(); });
  }

  // Вкладки
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCreateModal(); closeAddModal(); closeEditModal(); closeShareModal(); }
  });
}

// Запуск платформы
init();