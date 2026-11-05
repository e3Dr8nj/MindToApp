// ==========================================
// УПРАВЛЕНИЕ СПИСКОМ НЕЙРОСЕТЕЙ
// Редактор нейросетей, сохранение, сброс
// ==========================================

function showAIEditor(network) {
  const editorBox = document.getElementById('ai-editor-box');
  const title = document.getElementById('ai-editor-title');
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');

  if (!editorBox || !title || !idInput || !nameInput || !urlInput) return;

  editorBox.style.display = 'block';

  if (network) {
    title.textContent = t('editAI');
    idInput.value = network.id;
    nameInput.value = network.name;
    urlInput.value = network.url;
  } else {
    title.textContent = t('newAI');
    idInput.value = '';
    nameInput.value = '';
    urlInput.value = '';
  }
}

function saveAINetworkFromForm() {
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');
  const status = document.getElementById('ai-editor-status');

  if (!idInput || !nameInput || !urlInput) return;

  const id = idInput.value.trim();
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!id || !name || !url) {
    if (status) { status.textContent = t('fillAllFields'); status.className = 'modal-status error'; }
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (status) { status.textContent = t('urlMustStart'); status.className = 'modal-status error'; }
    return;
  }

  const networks = getAINetworks();
  const existingIndex = networks.findIndex(n => n.id === id);

  const newNetwork = { id, name, url };

  if (existingIndex > -1) {
    networks[existingIndex] = newNetwork;
  } else {
    networks.push(newNetwork);
  }

  saveAINetworks(networks);

  if (status) { status.textContent = t('aiSaved'); status.className = 'modal-status success'; }

  setTimeout(() => {
    hideAIEditor();
    if (typeof renderAINetworksList === 'function') renderAINetworksList();
    if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
  }, 800);
}

function resetAIList() {
  if (!confirm(t('resetListConfirm'))) return;
  resetAINetworks();
  renderAINetworksList();
  if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
}