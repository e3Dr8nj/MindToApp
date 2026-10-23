// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЙ
// ==========================================

function openEditModal(module) {
  const modal = document.getElementById('edit-modal');
  if (!modal) return;

  document.getElementById('edit-modal-title').textContent = `✏️ ${module.name}`;
  document.getElementById('edit-preview-icon').textContent = module.icon;
  document.getElementById('edit-preview-name').textContent = module.name;
  document.getElementById('edit-preview-desc').textContent = module.description || 'Нет описания';

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
    toggleBtn.textContent = '🙈 Скрыть код';
  } else {
    sourceCode.style.display = 'none';
    toggleBtn.textContent = '👁 Показать код';
  }
}

function copyCodeFromEditModal() {
  const sourceCode = document.getElementById('edit-source-code');
  if (!sourceCode || !sourceCode.value) {
    showToast('❌ Нет кода для копирования', 'error');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sourceCode.value).then(() => {
      showToast('✅ Код скопирован в буфер обмена!', 'success');
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
    showToast('✅ Код скопирован в буфер обмена!', 'success');
  } catch (e) {
    showToast('❌ Не удалось скопировать', 'error');
  }
  document.body.removeChild(textarea);
}

function copyCodeWithInstruction(module) {
  if (!module || !module.content) {
    showToast('❌ У приложения нет кода', 'error');
    return;
  }

  const instruction = getPrompt('EDIT_PROMPT_INSTRUCTION');
  const fullText = `${instruction}\n\n${module.content}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('✅ Промпт скопирован! Вставьте его в нейросеть.', 'success', 3000);
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
    showToast('✅ Промпт скопирован! Вставьте его в нейросеть.', 'success', 3000);
  } catch (e) {
    showToast('❌ Не удалось скопировать', 'error');
  }
  document.body.removeChild(textarea);
}

function copyEditPrompt() {
  const sourceCode = document.getElementById('edit-source-code');
  const status = document.getElementById('edit-status');

  if (!sourceCode || !sourceCode.value) {
    if (status) { status.textContent = '❌ Нет кода для копирования'; status.className = 'modal-status error'; }
    return;
  }

  const instruction = getPrompt('EDIT_PROMPT_INSTRUCTION');
  const fullText = `${instruction}\n\n${sourceCode.value}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullText).then(() => {
      if (status) { status.textContent = '✅ Промпт скопирован! Вставьте его в нейросеть.'; status.className = 'modal-status success'; }
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
    if (statusEl) { statusEl.textContent = '✅ Промпт скопирован! Вставьте его в нейросеть.'; statusEl.className = 'modal-status success'; }
  } catch (e) {
    if (statusEl) { statusEl.textContent = '❌ Не удалось скопировать'; statusEl.className = 'modal-status error'; }
  }
  document.body.removeChild(textarea);
}