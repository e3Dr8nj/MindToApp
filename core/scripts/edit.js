// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ
// ==========================================

let currentEditModule = null;

const EDIT_PROMPT_INSTRUCTION = `Ты опытный фронтенд-разработчик. Ниже представлен полный HTML-код моего приложения. Я хочу его отредактировать. 

Пожалуйста, проанализируй код. В следующем сообщении я напишу, что именно нужно изменить.

ВАЖНЫЕ ПРАВИЛА:
1. Сохрани блок <script type="application/json" id="manifest"> без изменений.
2. Когда будешь выдавать обновленный код, верни его ПОЛНОСТЬЮ, от <!DOCTYPE html> до </html>, без сокращений и без пояснений текстом.
3. Весь CSS должен быть внутри <style>, весь JS внутри <script>.

КОД ПРИЛОЖЕНИЯ:`;

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
    sourceCodeTextarea.style.display = 'none'; // Скрыто по умолчанию
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
  
  const fullPrompt = EDIT_PROMPT_INSTRUCTION + '\n\n' + currentEditModule.content;
  
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