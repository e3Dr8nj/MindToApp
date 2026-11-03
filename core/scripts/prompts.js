// ==========================================
// ЕДИНЫЙ ПРОМПТ ПЛАТФОРМЫ (использует i18n)
// ==========================================

function getPrompt() {
  var lang = getCurrentLanguage();
  var stored = localStorage.getItem('platformPrompt_' + lang);
  var prompt = stored || t('promptText');
  return prompt.endsWith('\n') ? prompt : prompt + '\n';
}

function setPrompt(text) {
  var lang = getCurrentLanguage();
  var trimmed = text.replace(/\n+$/, '');
  localStorage.setItem('platformPrompt_' + lang, trimmed);
}

function resetPrompt() {
  var lang = getCurrentLanguage();
  localStorage.removeItem('platformPrompt_' + lang);
  return t('promptText') + '\n';
}

// ==========================================
// ОБНОВЛЕНИЕ ПРЕВЬЮ ПРОМПТА
// ==========================================

function updatePromptPreview() {
  var promptText = document.getElementById('prompt-text');
  if (promptText) {
    var ideaInput = document.getElementById('user-idea-input');
    var idea = ideaInput ? ideaInput.value.trim() : '';
    promptText.value = idea ? getPrompt() + '\n' + idea : getPrompt();
  }
}