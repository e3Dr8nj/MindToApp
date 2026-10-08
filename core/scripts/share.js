// ==========================================
// ШАРИНГ ПРИЛОЖЕНИЙ
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
  const copyCodeStatus = $('copy-code-status');
  
  if (sharePreviewIcon) sharePreviewIcon.textContent = module.icon;
  if (sharePreviewName) sharePreviewName.textContent = module.name;
  if (sharePreviewDesc) sharePreviewDesc.textContent = module.description || '';
  if (copyCodeStatus) {
    copyCodeStatus.textContent = '';
    copyCodeStatus.className = 'modal-status';
  }
  
  const shareModalEl = $('share-modal');
  if (shareModalEl) shareModalEl.classList.add('active');
}

function closeShareModal() {
  const shareModalEl = $('share-modal');
  if (shareModalEl) shareModalEl.classList.remove('active');
  currentShareModule = null;
}

// Копирование HTML-кода приложения в буфер обмена
function copyAppCode() {
  if (!currentShareModule || !currentShareModule.content) return;
  
  const copyBtn = $('copy-app-code-btn');
  const statusEl = $('copy-code-status');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentShareModule.content).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать код', 2000);
      }
      if (statusEl) showStatus(statusEl, '✅ HTML-код скопирован в буфер обмена!', 'success');
    }).catch(() => {
      if (statusEl) showStatus(statusEl, '❌ Не удалось скопировать код', 'error');
    });
  } else {
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = currentShareModule.content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Скопировать код', 2000);
      }
      if (statusEl) showStatus(statusEl, '✅ HTML-код скопирован в буфер обмена!', 'success');
    } catch (e) {
      if (statusEl) showStatus(statusEl, '❌ Не удалось скопировать код', 'error');
    }
    document.body.removeChild(textarea);
  }
}

// Открытие Gist с кодом в буфере обмена
function openGistWithCode() {
  if (!currentShareModule || !currentShareModule.content) return;
  
  // Сначала копируем код в буфер
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentShareModule.content).then(() => {
      alert('✅ Код приложения скопирован в буфер обмена!\n\nСейчас откроется GitHub Gist. Просто нажмите Ctrl+V (или Cmd+V на Mac), выберите "Secret Gist" и нажмите "Create gist".');
      window.open('https://gist.github.com', '_blank');
    }).catch(() => {
      alert('⚠️ Не удалось автоматически скопировать код.\n\nСкопируйте его вручную через кнопку "📋 Скопировать код" выше.');
    });
  } else {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = currentShareModule.content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('✅ Код приложения скопирован в буфер обмена!\n\nСейчас откроется GitHub Gist. Просто нажмите Ctrl+V (или Cmd+V на Mac), выберите "Secret Gist" и нажмите "Create gist".');
      window.open('https://gist.github.com', '_blank');
    } catch (e) {
      alert('⚠️ Не удалось автоматически скопировать код.\n\nСкопируйте его вручную через кнопку "📋 Скопировать код" выше.');
    }
    document.body.removeChild(textarea);
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}