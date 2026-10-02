function updatePromptPreview() {
  if (!promptText) return;
  const userIdea = userIdeaInput?.value.trim() || '[опиши здесь функционал и дизайн приложения]';
  promptText.value = BASE_PROMPT + userIdea;
}

function openCreateModal() {
  if (createModal) {
    createModal.classList.add('active');
    if (generatedCodeInput) generatedCodeInput.value = '';
    if (userIdeaInput) userIdeaInput.value = '';
    if (createStatus) { createStatus.textContent = ''; createStatus.className = 'modal-status'; }
    updatePromptPreview();
  }
}

function closeCreateModal() {
  if (createModal) createModal.classList.remove('active');
}

function copyPrompt() {
  if (!promptText) return;
  const copyBtn = $('copy-prompt-btn');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptText.value).then(() => {
      if (copyBtn) { copyBtn.textContent = '✅ Скопировано!'; setTimeout(() => copyBtn.textContent = '📋 Копировать промпт', 2000); }
    });
  } else {
    promptText.select(); document.execCommand('copy');
    if (copyBtn) { copyBtn.textContent = '✅ Скопировано!'; setTimeout(() => copyBtn.textContent = '📋 Копировать промпт', 2000); }
  }
}

async function createAppFromText() {
  if (!generatedCodeInput || !createStatus) return;
  const code = generatedCodeInput.value.trim();
  if (!code) return showStatus(createStatus, '❌ Вставьте HTML-код', 'error');
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) return showStatus(createStatus, '❌ Это не похоже на HTML-код', 'error');

  showStatus(createStatus, '⏳ Анализ кода...', 'loading');
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest">');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('В manifest не хватает полей');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Приложение с таким ID уже существует');

    const newModule = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Создано через AI', content: code, isCustom: true, isLocal: true, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    allModules.push({ ...manifest, content: code, url: URL.createObjectURL(new Blob([code], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });

    showStatus(createStatus, '✅ Приложение успешно создано!', 'success');
    setTimeout(() => { closeCreateModal(); renderInstalledApps(); renderAllApps(); }, 800);
  } catch (error) {
    showStatus(createStatus, `❌ Ошибка: ${error.message}`, 'error');
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}