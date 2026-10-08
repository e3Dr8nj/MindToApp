// ==========================================
// ШАРИНГ ЧЕРЕЗ ВНЕШНИЕ ХОСТИНГИ
// ==========================================

let currentShareModule = null;

// Открытие модалки шаринга
function openShareModal(module) {
  if (!module.content) {
    alert('Не удалось получить код приложения');
    return;
  }
  
  currentShareModule = module;
  
  const sharePreviewIcon = $('share-preview-icon');
  const sharePreviewName = $('share-preview-name');
  const sharePreviewDesc = $('share-preview-desc');
  const shareUrlInput = $('share-url-input');
  const shareStatus = $('share-status');
  
  if (sharePreviewIcon) sharePreviewIcon.textContent = module.icon;
  if (sharePreviewName) sharePreviewName.textContent = module.name;
  if (sharePreviewDesc) sharePreviewDesc.textContent = module.description || '';
  if (shareUrlInput) shareUrlInput.value = '';
  if (shareStatus) {
    shareStatus.textContent = '';
    shareStatus.className = 'modal-status';
  }
  
  const shareModalEl = $('share-modal');
  if (shareModalEl) shareModalEl.classList.add('active');
}

function closeShareModal() {
  const shareModalEl = $('share-modal');
  if (shareModalEl) shareModalEl.classList.remove('active');
  currentShareModule = null;
}

// Открытие Gist с предзаполненным кодом
function openGistWithCode() {
  if (!currentShareModule || !currentShareModule.content) return;
  
  // Копируем код в буфер обмена для удобства
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentShareModule.content).then(() => {
      alert('✅ Код приложения скопирован в буфер обмена!\n\nСейчас откроется GitHub Gist. Просто нажмите Ctrl+V (Вставить), выберите "Secret Gist" и нажмите "Create gist".');
      window.open('https://gist.github.com', '_blank');
    }).catch(() => {
      window.open('https://gist.github.com', '_blank');
    });
  } else {
    window.open('https://gist.github.com', '_blank');
  }
}

// Добавление приложения по внешней ссылке
async function addAppFromLink() {
  const urlInput = $('share-url-input');
  const statusEl = $('share-status');
  
  if (!urlInput) return;
  let url = urlInput.value.trim();
  
  if (!url) {
    showStatus(statusEl, '❌ Введите ссылку', 'error');
    return;
  }
  
  // Проверка на Raw ссылку Gist (часто люди кидают обычную ссылку на Gist)
  if (url.includes('gist.github.com') && !url.includes('/raw')) {
    showStatus(statusEl, '⚠️ Нужна ссылка на Raw файл. Нажмите кнопку "Raw" на странице Gist.', 'error');
    return;
  }
  
  showStatus(statusEl, '⏳ Загрузка...', 'loading');
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const code = await response.text();
    
    if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
      throw new Error('По этой ссылке нет HTML-кода');
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) throw new Error('В коде нет Manifest');
    
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Неверный формат Manifest');
    
    if (allModules.some(m => m.id === manifest.id)) {
      if (!confirm(`Приложение "${manifest.name}" уже существует. Заменить?`)) {
        showStatus(statusEl, '', '');
        return;
      }
      removeCustomModule(manifest.id);
    }
    
    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Добавлено по ссылке',
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
    
    showStatus(statusEl, `✅ Приложение "${manifest.name}" добавлено!`, 'success');
    setTimeout(() => {
      closeShareModal();
      renderInstalledApps();
      renderAllApps();
    }, 1500);
    
  } catch (error) {
    showStatus(statusEl, `❌ Ошибка: ${error.message}`, 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}