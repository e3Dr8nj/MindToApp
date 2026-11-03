// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЙ
// ==========================================

function openEditModal(module) {
  const modal = document.getElementById('edit-modal');
  if (!modal) return;

  document.getElementById('edit-modal-title').textContent = `✏️ ${module.name}`;
  document.getElementById('edit-preview-icon').textContent = module.icon;
  document.getElementById('edit-preview-name').textContent = module.name;
  document.getElementById('edit-preview-desc').textContent = module.description || t('noDescription');

  const sourceCode = document.getElementById('edit-source-code');
  if (sourceCode) {
    sourceCode.value = module.content || '';
    sourceCode.style.display = 'none';
  }

  const status = document.getElementById('edit-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('active');
}

function toggleCodeVisibility() {
  const sourceCode = document.getElementById('edit-source-code');
  const toggleBtn = document.getElementById('toggle-code-btn');
  
  if (!sourceCode || !toggleBtn) return;

  if (sourceCode.style.display === 'none') {
    sourceCode.style.display = 'block';
    toggleBtn.textContent = '🙈 Hide code';
  } else {
    sourceCode.style.display = 'none';
    toggleBtn.textContent = '👁 Show code';
  }
}

function copyCodeFromEditModal() {
  const sourceCode = document.getElementById('edit-source-code');
  if (!sourceCode || !sourceCode.value) {
    showToast(t('noCode'), 'error');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sourceCode.value).then(() => {
      showToast(t('codeCopied'), 'success');
    }).catch(() => {
      fallbackCopyCode(sourceCode.value);
    });
  } else {
    fallbackCopyCode(sourceCode.value);
  }
}

function fallbackCopyCode(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(t('codeCopied'), 'success');
  } catch (e) {
    showToast(t('copyFailed'), 'error');
  }
  document.body.removeChild(textarea);
}

// Копирует промпт для редактирования + код приложения (для меню ⚙️ → Редактировать)
function copyCodeWithInstruction(module) {
  if (!module || !module.content) {
    showToast(t('noCode'), 'error');
    return;
  }

  // Используем специальный промпт для редактирования
  const prompt = getEditPrompt();
  const fullText = `${prompt}\n\n${module.content}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast(t('promptCopied'), 'success', 3000);
    }).catch(() => {
      fallbackCopyWithInstruction(fullText);
    });
  } else {
    fallbackCopyWithInstruction(fullText);
  }
}

function fallbackCopyWithInstruction(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(t('promptCopied'), 'success', 3000);
  } catch (e) {
    showToast(t('copyFailed'), 'error');
  }
  document.body.removeChild(textarea);
}

// Копирует промпт для редактирования + код из модалки редактирования
function copyEditPrompt() {
  const sourceCode = document.getElementById('edit-source-code');
  const status = document.getElementById('edit-status');

  if (!sourceCode || !sourceCode.value) {
    if (status) { status.textContent = t('noCode'); status.className = 'modal-status error'; }
    return;
  }

  // Используем специальный промпт для редактирования
  const prompt = getEditPrompt();
  const fullText = `${prompt}\n\n${sourceCode.value}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      if (status) { status.textContent = t('promptCopied'); status.className = 'modal-status success'; }
    }).catch(() => {
      fallbackCopyEditPrompt(fullText, status);
    });
  } else {
    fallbackCopyEditPrompt(fullText, status);
  }
}

function fallbackCopyEditPrompt(text, statusEl) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (statusEl) { statusEl.textContent = t('promptCopied'); statusEl.className = 'modal-status success'; }
  } catch (e) {
    if (statusEl) { statusEl.textContent = t('copyFailed'); statusEl.className = 'modal-status error'; }
  }
  document.body.removeChild(textarea);
}