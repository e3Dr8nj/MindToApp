// ==========================================
// СОЗДАНИЕ ПРИЛОЖЕНИЯ ЧЕРЕЗ СТАРУЮ МОДАЛКУ
// ==========================================

function updatePromptPreview() {
  if (!userIdeaInput || !promptText) return;
  
  const idea = userIdeaInput.value.trim();
  if (!idea) {
    promptText.value = '';
    return;
  }
  
  // Используем getPrompt() из prompts.js
  const fullPrompt = getPrompt('BASE_PROMPT') + idea + getPrompt('BUILDER_PLATFORM_INSTRUCTION');
  promptText.value = fullPrompt;
}

function copyPrompt() {
  const copyBtn = $('copy-prompt-btn');
  const statusEl = $('create-status');
  
  if (!promptText || !promptText.value) {
    if (statusEl) {
      statusEl.textContent = '❌ Сначала опишите идею приложения';
      statusEl.className = 'modal-status error';
    }
    return;
  }
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptText.value).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 1. Скопировать промпт', 2000);
      }
      if (statusEl) {
        statusEl.textContent = '✅ Промпт скопирован! Теперь вставьте его в нейросеть.';
        statusEl.className = 'modal-status success';
      }
    }).catch(() => {
      if (statusEl) {
        statusEl.textContent = '❌ Не удалось скопировать';
        statusEl.className = 'modal-status error';
      }
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = promptText.value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 1. Скопировать промпт', 2000);
      }
      if (statusEl) {
        statusEl.textContent = '✅ Промпт скопирован! Теперь вставьте его в нейросеть.';
        statusEl.className = 'modal-status success';
      }
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = '❌ Не удалось скопировать';
        statusEl.className = 'modal-status error';
      }
    }
    document.body.removeChild(textarea);
  }
}

function createAppFromText() {
  const codeInput = $('generated-code-input');
  const statusEl = $('create-status');
  const createBtn = $('confirm-create-btn');
  
  if (!codeInput || !statusEl) return;
  
  const code = codeInput.value.trim();
  if (!code) {
    statusEl.textContent = '❌ Вставьте HTML-код от нейросети';
    statusEl.className = 'modal-status error';
    return;
  }
  
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    statusEl.textContent = '❌ Это не похоже на HTML-код';
    statusEl.className = 'modal-status error';
    return;
  }
  
  statusEl.textContent = '⏳ Анализ кода...';
  statusEl.className = 'modal-status loading';
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest"> в <head>');
    
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) {
      throw new Error('В manifest не хватает полей id, name или icon');
    }
    
    if (allModules.some(m => m.id === manifest.id)) {
      throw new Error('Приложение с таким ID уже существует');
    }
    
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
    
    allModules.push({
      ...manifest,
      content: code,
      url: URL.createObjectURL(new Blob([code], { type: 'text/html' })),
      isCustom: true,
      isLocal: true,
      isFolder: false
    });
    
    statusEl.textContent = '✅ Приложение успешно создано!';
    statusEl.className = 'modal-status success';
    
    if (createBtn) {
      createBtn.textContent = '✅ Создано!';
      setTimeout(() => {
        createBtn.textContent = '🚀 Создать приложение';
        closeCreateModal();
        renderInstalledApps();
        renderAllApps();
      }, 1000);
    }
  } catch (error) {
    statusEl.textContent = `❌ Ошибка: ${error.message}`;
    statusEl.className = 'modal-status error';
  }
}

function openCreateModal() {
  const modal = $('create-modal');
  if (modal) modal.classList.add('active');
  
  // Очищаем поля
  if (userIdeaInput) userIdeaInput.value = '';
  if (generatedCodeInput) generatedCodeInput.value = '';
  if (promptText) promptText.value = '';
  
  const statusEl = $('create-status');
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.className = 'modal-status';
  }
}

function closeCreateModal() {
  const modal = $('create-modal');
  if (modal) modal.classList.remove('active');
}