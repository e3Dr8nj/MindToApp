// ==========================================
// ЕДИНЫЙ ПРОМПТ ПЛАТФОРМЫ (использует i18n)
// ==========================================

function getPrompt() {
  const lang = getCurrentLanguage();
  const stored = localStorage.getItem(`platformPrompt_${lang}`);
  const prompt = stored || t('prompt');
  return prompt.endsWith('\n') ? prompt : prompt + '\n';
}

function setPrompt(text) {
  const lang = getCurrentLanguage();
  const trimmed = text.replace(/\n+$/, '');
  localStorage.setItem(`platformPrompt_${lang}`, trimmed);
}

function resetPrompt() {
  const lang = getCurrentLanguage();
  localStorage.removeItem(`platformPrompt_${lang}`);
  return t('prompt') + '\n';
}

// ==========================================
// ОБНОВЛЕНИЕ ПРЕВЬЮ ПРОМПТА
// ==========================================

function updatePromptPreview() {
  const promptText = document.getElementById('prompt-text');
  if (promptText) {
    const ideaInput = document.getElementById('user-idea-input');
    const idea = ideaInput ? ideaInput.value.trim() : '';
    promptText.value = idea ? `${getPrompt()}\n${idea}` : getPrompt();
  }
}