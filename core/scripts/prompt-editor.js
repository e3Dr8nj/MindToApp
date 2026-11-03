// ==========================================
// РЕДАКТОР ПРОМПТОВ
// ==========================================

function openPromptsModal() {
  var modal = document.getElementById('prompts-modal');
  if (!modal) return;

  var textarea = document.getElementById('prompt-editor-textarea');
  var status = document.getElementById('prompt-editor-status');

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
  var modal = document.getElementById('prompts-modal');
  if (modal) modal.classList.remove('active');
}

function savePrompt() {
  var textarea = document.getElementById('prompt-editor-textarea');
  var status = document.getElementById('prompt-editor-status');

  if (!textarea) return;

  var value = textarea.value.trim();
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

  var textarea = document.getElementById('prompt-editor-textarea');
  var status = document.getElementById('prompt-editor-status');

  var defaultText = resetPrompt();
  if (textarea) textarea.value = defaultText;
  
  // ВАЖНО: сразу сохраняем в localStorage!
  setPrompt(defaultText);

  if (status) {
    status.textContent = t('promptReset');
    status.className = 'modal-status success';
  }
}