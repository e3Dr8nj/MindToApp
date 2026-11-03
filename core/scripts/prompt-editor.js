// ==========================================
// РЕДАКТОР ПРОМПТОВ
// ==========================================

function openPromptsModal() {
  const modal = document.getElementById('prompts-modal');
  if (!modal) return;

  const textarea = document.getElementById('prompt-editor-textarea');
  const status = document.getElementById('prompt-editor-status');

  if (textarea) {
    textarea.value = getPrompt();
  }
  if (status) {
    status.textContent = '';
    status.className = 'modal-status';
  }

  modal.classList.add('active');
}

function closePromptsModal() {
  const modal = document.getElementById('prompts-modal');
  if (modal) modal.classList.remove('active');
}

function savePrompt() {
  const textarea = document.getElementById('prompt-editor-textarea');
  const status = document.getElementById('prompt-editor-status');

  if (!textarea) return;

  const value = textarea.value.trim();
  if (!value) {
    if (status) {
      status.textContent = t('promptEmpty');
      status.className = 'modal-status error';
    }
    return;
  }

  setPrompt(value);

  if (status) {
    status.textContent = t('promptSaved');
    status.className = 'modal-status success';
  }
}

function resetPromptToDefault() {
  if (!confirm(t('resetPromptConfirm'))) return;

  const textarea = document.getElementById('prompt-editor-textarea');
  const status = document.getElementById('prompt-editor-status');

  const defaultText = resetPrompt();
  if (textarea) textarea.value = defaultText;

  if (status) {
    status.textContent = t('promptReset');
    status.className = 'modal-status success';
  }
}