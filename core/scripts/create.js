// ==========================================
// СТАРАЯ МОДАЛКА СОЗДАНИЯ ПРИЛОЖЕНИЯ
// ==========================================

function updatePromptPreview() {
  const promptText = document.getElementById('prompt-text');
  if (!promptText) return;
  const ideaInput = document.getElementById('user-idea-input');
  const idea = ideaInput ? ideaInput.value.trim() : '';
  promptText.value = idea ? `${getPrompt()}\n\n${idea}` : getPrompt();
}

function openCreateModal() {
  const modal = document.getElementById('create-modal');
  const ideaInput = document.getElementById('user-idea-input');
  const codeInput = document.getElementById('generated-code-input');
  const status = document.getElementById('create-status');

  if (ideaInput) ideaInput.value = '';
  if (codeInput) codeInput.value = '';
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  updatePromptPreview();
  updateCreateAILinks();

  if (modal) modal.classList.add('active');
}

function closeCreateModal() {
  const modal = document.getElementById('create-modal');
  if (modal) modal.classList.remove('active');
}

function updateCreateAILinks() {
  const linksContainer = document.getElementById('create-ai-links');
  if (!linksContainer) return;

  linksContainer.innerHTML = '';

  if (typeof getAINetworks === 'function') {
    const networks = getAINetworks();
    if (networks.length === 0) {
      linksContainer.innerHTML = `<div style="color: var(--description-color); font-size: 13px; padding: 10px; text-align: center;">${t('noAiNetworks')}</div>`;
      return;
    }
    networks.forEach(network => {
      const link = document.createElement('a');
      link.href = network.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'ai-link';
      link.textContent = network.name;
      linksContainer.appendChild(link);
    });
  } else {
    linksContainer.innerHTML = `<div style="color: var(--description-color); font-size: 13px;">${t('aiNotLoaded')}</div>`;
  }
}

function createAppFromText() {
  const codeInput = document.getElementById('generated-code-input');
  const status = document.getElementById('create-status');

  if (!codeInput) return;
  const code = codeInput.value.trim();

  if (!code) {
    if (status) { status.textContent = t('enterCode'); status.className = 'modal-status error'; }
    return;
  }

  if (status) { status.textContent = t('analyzing'); status.className = 'modal-status loading'; }

  // Используем универсальную функцию создания приложения
  const result = createAppFromHtml(code, { defaultDescription: 'Created with AI' });

  if (result.success) {
    if (status) { status.textContent = t('appCreated', { name: result.manifest.name }); status.className = 'modal-status success'; }
    setTimeout(() => {
      closeCreateModal();
      showToast(t('appCreated', { name: result.manifest.name }), 'success', 3000);
    }, 1000);
  } else {
    if (status) { status.textContent = getCreateAppErrorMessage(result.error); status.className = 'modal-status error'; }
  }
}