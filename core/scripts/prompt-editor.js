// ==========================================
// UI РЕДАКТОРА ПРОМПТОВ
// ==========================================

function openPromptsModal() {
  const modal = $('prompts-modal');
  const select = $('prompt-select');
  const textarea = $('prompt-editor-textarea');
  const desc = $('prompt-desc');
  const status = $('prompt-editor-status');
  
  if (!modal) return;
  
  // Очищаем и заполняем селект
  select.innerHTML = '';
  for (const [key, def] of Object.entries(PROMPT_DEFINITIONS)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = def.name;
    select.appendChild(option);
  }
  
  // Загружаем первый промпт
  loadPromptToEditor(select.value);
  
  // Обработчик смены промпта в селекте
  select.addEventListener('change', () => {
    loadPromptToEditor(select.value);
    if (status) { status.textContent = ''; status.className = 'modal-status'; }
  });
  
  // Обработчик сохранения
  $('save-prompt-btn').onclick = () => {
    const key = select.value;
    const value = textarea.value.trim();
    
    if (!value) {
      status.textContent = '❌ Промпт не может быть пустым';
      status.className = 'modal-status error';
      return;
    }
    
    saveCustomPrompt(key, value);
    status.textContent = '✅ Промпт успешно сохранен!';
    status.className = 'modal-status success';
    setTimeout(() => { 
      if (status) { status.textContent = ''; status.className = 'modal-status'; } 
    }, 2500);
  };
  
  // Обработчик сброса
  $('reset-prompt-btn').onclick = () => {
    const key = select.value;
    resetPrompt(key);
    loadPromptToEditor(key); // Перезагружаем дефолтное значение
    
    status.textContent = '🔄 Промпт сброшен к стандартному значению';
    status.className = 'modal-status success';
    setTimeout(() => { 
      if (status) { status.textContent = ''; status.className = 'modal-status'; } 
    }, 2500);
  };
  
  modal.classList.add('active');
}

function loadPromptToEditor(key) {
  const textarea = $('prompt-editor-textarea');
  const desc = $('prompt-desc');
  const resetBtn = $('reset-prompt-btn');
  
  // Загружаем текст и описание
  textarea.value = getPrompt(key);
  desc.textContent = PROMPT_DEFINITIONS[key].desc;
  
  // Показываем кнопку сброса только если промпт был изменен пользователем
  const customPrompts = getAllCustomPrompts();
  if (customPrompts[key]) {
    resetBtn.style.display = 'inline-block';
  } else {
    resetBtn.style.display = 'none';
  }
}

function closePromptsModal() {
  const modal = $('prompts-modal');
  if (modal) modal.classList.remove('active');
}