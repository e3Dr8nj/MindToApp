async function openEditModal(module) {
  if (!editModal) return;
  currentEditingModule = module;
  
  if (editModalTitle) editModalTitle.textContent = `✏️ Редактировать: ${module.name}`;
  if (editPreviewIcon) editPreviewIcon.textContent = module.icon;
  if (editPreviewName) editPreviewName.textContent = module.name;
  if (editPreviewDesc) editPreviewDesc.textContent = module.description || '';
  
  let sourceCode = module.content || '';
  if (!sourceCode && module.url) {
    if (editSourceCode) { editSourceCode.value = '⏳ Загрузка...'; editSourceCode.style.display = 'block'; }
    sourceCode = await loadContentFromUrl(module.url) || '// ⚠️ Не удалось загрузить код.';
    module.content = sourceCode;
    if (module.isCustom) saveContentToCustomModule(module.id, sourceCode);
  }
  
  if (editSourceCode) { editSourceCode.value = sourceCode; editSourceCode.style.display = 'none'; }
  const toggleBtn = $('toggle-code-btn');
  if (toggleBtn) toggleBtn.textContent = '👁 Показать код приложения';
  
  if (editChangesInput) editChangesInput.value = '';
  if (editNewCodeInput) editNewCodeInput.value = '';
  if (editStatus) { editStatus.textContent = ''; editStatus.className = 'modal-status'; }
  
  editModal.classList.add('active');
}

function closeEditModal() {
  if (editModal) editModal.classList.remove('active');
  currentEditingModule = null;
}

function toggleCodeVisibility() {
  if (!editSourceCode) return;
  const btn = $('toggle-code-btn');
  const isHidden = editSourceCode.style.display === 'none';
  editSourceCode.style.display = isHidden ? 'block' : 'none';
  if (btn) btn.textContent = isHidden ? '🙈 Скрыть код' : '👁 Показать код приложения';
}

function generateEditPrompt() {
  if (!currentEditingModule) return '';
  const sourceCode = editSourceCode?.value || '';
  const changes = editChangesInput?.value.trim() || '';
  if (!changes) return '';
  if (!sourceCode.includes('<!DOCTYPE') && !sourceCode.includes('<html')) {
    return '⚠️ ОШИБКА: Сохраненный код не является HTML-файлом. Удалите приложение и создайте заново.';
  }
  
  const platformInstruction = `Ты — эксперт по веб-разработке. Модифицируй предоставленный HTML-код для платформы MindToApp.
ПРАВИЛА:
1. Верни ТОЛЬКО полный код index.html в одном блоке markdown (\`\`\`html ... \`\`\`). НЕ сокращай код.
2. Manifest: <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>
3. Уникальный ID: ОБЯЗАТЕЛЬНО добавь 6 случайных цифр к ID (например, "notes-482915").
4. CSS в <style>, JS в <script>. Без внешних библиотек.
5. body { min-height: calc(100vh - 60px); margin: 0; }. Без alert/confirm/prompt.`;

  return `=== ИСХОДНЫЙ КОД ===\n${sourceCode}\n=== КОНЕЦ КОДА ===\n\n${platformInstruction}\n\n=== ЧТО ИЗМЕНИТЬ ===\n${changes}\n=== КОНЕЦ ===\n\nВЕРНИ ТОЛЬКО ПОЛНЫЙ HTML-КОД.`;
}

function copyEditPrompt() {
  const changes = editChangesInput?.value.trim();
  if (!changes) return showStatus(editStatus, '❌ Сначала опишите, что нужно изменить!', 'error');
  const prompt = generateEditPrompt();
  const copyBtn = $('copy-edit-prompt-btn');
  if (!prompt || prompt.startsWith('⚠️')) return showStatus(editStatus, prompt || '❌ Ошибка', 'error');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(() => {
      if (copyBtn) { copyBtn.textContent = '✅ Скопировано!'; setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000); }
      showStatus(editStatus, '✅ Промпт скопирован!', 'success');
    });
  } else {
    const ta = document.createElement('textarea'); ta.value = prompt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    if (copyBtn) { copyBtn.textContent = '✅ Скопировано!'; setTimeout(() => copyBtn.textContent = '📋 Скопировать промпт', 2000); }
    showStatus(editStatus, '✅ Промпт скопирован!', 'success');
  }
}

async function applyEditChanges() {
  if (!currentEditingModule || !editNewCodeInput || !editStatus) return;
  const newCode = editNewCodeInput.value.trim();
  if (!newCode) return showStatus(editStatus, '❌ Вставьте исправленный HTML-код', 'error');
  if (!newCode.includes('<html') && !newCode.includes('<!DOCTYPE')) return showStatus(editStatus, '❌ Это не похоже на HTML-код', 'error');

  showStatus(editStatus, '⏳ Анализ кода...', 'loading');
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(newCode, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Не найден тег <script id="manifest">');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не хватает полей manifest');
    if (manifest.id === currentEditingModule.id) throw new Error('ID не изменился! Добавьте 6 цифр к ID.');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Такой ID уже существует.');
    
    const newModule = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || `Копия: ${currentEditingModule.name}`, content: newCode, isCustom: true, isLocal: true, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    allModules.push({ ...manifest, content: newCode, url: URL.createObjectURL(new Blob([newCode], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
    
    showStatus(editStatus, `✅ Копия "${manifest.name}" создана!`, 'success');
    setTimeout(() => { closeEditModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) {
    showStatus(editStatus, `❌ Ошибка: ${error.message}`, 'error');
  }
}