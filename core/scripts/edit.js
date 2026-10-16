// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ (КОПИРОВАНИЕ)
// ==========================================

let currentEditModule = null;

// ГЛАВНАЯ ФУНКЦИЯ: Копирование кода + инструкции прямо из карточки
function copyCodeWithInstruction(module, buttonElement) {
  if (!module || !module.content) {
    console.error('Нет кода для копирования');
    return;
  }
  
  // Используем getPrompt() из prompts.js
  const fullPrompt = module.content + '\n\n' + getPrompt('EDIT_PROMPT_INSTRUCTION');
  
  const onSuccess = () => {
    if (buttonElement) {
      const originalText = buttonElement.textContent;
      buttonElement.textContent = '✅';
      buttonElement.title = 'Скопировано!';
      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.title = 'Редактировать';
      }, 2000);
    }
  };

  const onError = (err) => {
    console.error('Ошибка копирования:', err);
    alert('❌ Не удалось скопировать код');
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(onSuccess).catch(onError);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = fullPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      onError(e);
    }
    document.body.removeChild(textarea);
  }
}

function openEditModal(module) {
  currentEditModule = module;
  
  const previewIcon = $('edit-preview-icon');
  const previewName = $('edit-preview-name');
  const previewDesc = $('edit-preview-desc');
  const sourceCodeTextarea = $('edit-source-code');
  const editStatus = $('edit-status');
  
  if (previewIcon) previewIcon.textContent = module.icon;
  if (previewName) previewName.textContent = module.name;
  if (previewDesc) previewDesc.textContent = module.description || '';
  
  if (sourceCodeTextarea) {
    sourceCodeTextarea.value = module.content || '';
    sourceCodeTextarea.style.display = 'none';
  }
  
  if (editStatus) {
    editStatus.textContent = '';
    editStatus.className = 'modal-status';
  }
  
  const editModalEl = $('edit-modal');
  if (editModalEl) editModalEl.classList.add('active');
}

function closeEditModal() {
  const editModalEl = $('edit-modal');
  if (editModalEl) editModalEl.classList.remove('active');
  currentEditModule = null;
}

function toggleCodeVisibility() {
  const sourceCodeTextarea = $('edit-source-code');
  const toggleBtn = $('toggle-code-btn');
  if (sourceCodeTextarea) {
    if (sourceCodeTextarea.style.display === 'none') {
      sourceCodeTextarea.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = '🙈 Скрыть код';
    } else {
      sourceCodeTextarea.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = '👁 Показать код';
    }
  }
}

function copyCurrentCode() {
  if (!currentEditModule || !currentEditModule.content) return;
  
  const copyBtn = $('copy-code-btn');
  const statusEl = $('edit-status');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentEditModule.content).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Копировать код', 2000);
      }
      if (statusEl) showEditStatus(statusEl, '✅ Код приложения скопирован!', 'success');
    }).catch(() => {
      if (statusEl) showEditStatus(statusEl, '❌ Не удалось скопировать', 'error');
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = currentEditModule.content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Копировать код', 2000);
      }
      if (statusEl) showEditStatus(statusEl, '✅ Код приложения скопирован!', 'success');
    } catch (e) {
      if (statusEl) showEditStatus(statusEl, '❌ Не удалось скопировать', 'error');
    }
    document.body.removeChild(textarea);
  }
}

function copyEditPrompt() {
  if (!currentEditModule || !currentEditModule.content) return;
  
  const copyBtn = $('copy-edit-prompt-btn');
  const statusEl = $('edit-status');
  
  // Используем getPrompt() из prompts.js
  const fullPrompt = currentEditModule.content + '\n\n' + getPrompt('EDIT_PROMPT_INSTRUCTION');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '📋 Копировать код + инструкцию для AI', 2000);
      }
      if (statusEl) showEditStatus(statusEl, '✅ Код и инструкция скопированы! Вставьте в нейросеть.', 'success');
    }).catch(() => {
      if (statusEl) showEditStatus(statusEl, '❌ Не удалось скопировать', 'error');
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
        setTimeout(() => copyBtn.textContent = '📋 Копировать код + инструкцию для AI', 2000);
      }
      if (statusEl) showEditStatus(statusEl, '✅ Код и инструкция скопированы! Вставьте в нейросеть.', 'success');
    } catch (e) {
      if (statusEl) showEditStatus(statusEl, '❌ Не удалось скопировать', 'error');
    }
    document.body.removeChild(textarea);
  }
}

function showEditStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}