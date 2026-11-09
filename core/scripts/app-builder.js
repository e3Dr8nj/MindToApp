// ==========================================
// КОНСТРУКТОР ПРИЛОЖЕНИЙ
// ==========================================

function openAIPanel() {
  const aiPanel = document.getElementById('ai-panel');
  if (!aiPanel) return;
  aiPanel.style.display = 'block';
  setTimeout(() => { aiPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

function closeAIPanel() {
  const aiPanel = document.getElementById('ai-panel');
  if (aiPanel) aiPanel.style.display = 'none';
}

function openBuilder() {
  const ideaInput = document.getElementById('builder-idea-input');
  const codeInput = document.getElementById('builder-code-input');
  const status1 = document.getElementById('builder-status-1');
  const status3 = document.getElementById('builder-status-3');

  if (ideaInput) ideaInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status1) { status1.textContent = ''; status1.className = 'modal-status'; }
  if (status3) { status3.textContent = ''; status3.className = 'modal-status'; }

  const builderPanel = document.getElementById('builder-panel');
  if (builderPanel) builderPanel.style.display = 'block';

  setTimeout(() => {
    if (builderPanel) builderPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function closeBuilder() {
  const builderPanel = document.getElementById('builder-panel');
  if (builderPanel) builderPanel.style.display = 'none';
}

function copyBuilderPrompt() {
  const ideaInput = document.getElementById('builder-idea-input');
  const statusEl = document.getElementById('builder-status-1');
  const copyBtn = document.getElementById('builder-copy-prompt-btn');

  if (!ideaInput) return;
  const idea = ideaInput.value.trim();
  if (!idea) {
    showStatus(statusEl, t('enterIdea'), 'error');
    return;
  }

  const fullPrompt = `${getPrompt()}\n\n${idea}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      if (copyBtn) {
        copyBtn.textContent = t('copied');
        setTimeout(() => copyBtn.textContent = t('copyPrompt'), 2000);
      }
      showStatus(statusEl, t('promptCopied'), 'success');
    }).catch(() => {
      showStatus(statusEl, t('copyFailed'), 'error');
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
        copyBtn.textContent = t('copied');
        setTimeout(() => copyBtn.textContent = t('copyPrompt'), 2000);
      }
      showStatus(statusEl, t('promptCopied'), 'success');
    } catch (e) {
      showStatus(statusEl, t('copyFailed'), 'error');
    }
    document.body.removeChild(textarea);
  }
}

function openSelectedAI() {
  const selectEl = document.getElementById('builder-ai-select');
  if (!selectEl) return;
  const url = selectEl.value;
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function createFromBuilder() {
  const codeInput = document.getElementById('builder-code-input');
  const statusEl = document.getElementById('builder-status-3');
  const createBtn = document.getElementById('builder-create-btn');

  if (!codeInput || !statusEl) return;
  const code = codeInput.value.trim();
  if (!code) {
    showStatus(statusEl, t('enterCode'), 'error');
    return;
  }

  showStatus(statusEl, t('analyzing'), 'loading');

  // Используем универсальную функцию создания приложения
  const result = createAppFromHtml(code, { defaultDescription: 'Created via builder' });

  if (result.success) {
    showStatus(statusEl, '✅', 'success');
    if (createBtn) {
      createBtn.textContent = t('created');
      setTimeout(() => {
        createBtn.textContent = t('createApp');
        closeBuilder();
      }, 1000);
    }
  } else {
    showStatus(statusEl, getCreateAppErrorMessage(result.error), 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}