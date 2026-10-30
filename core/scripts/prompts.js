// ==========================================
// ЕДИНЫЙ ПРОМПТ ПЛАТФОРМЫ
// ==========================================

const DEFAULT_PLATFORM_PROMPT = `КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>. Если в значении name в конце есть v и номер после, то увеличь номер версии, если такого нет, поставь v1 в конце.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.
7. Добавь возможность управления сохраненными данными.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`;

// ==========================================
// ПОЛУЧЕНИЕ / СОХРАНЕНИЕ ПРОМПТА
// ==========================================

function getPrompt() {
  const stored = localStorage.getItem('platformPrompt');
  return stored || DEFAULT_PLATFORM_PROMPT;
}

function setPrompt(text) {
  localStorage.setItem('platformPrompt', text);
}

function resetPrompt() {
  localStorage.removeItem('platformPrompt');
  return DEFAULT_PLATFORM_PROMPT;
}

// ==========================================
// ОБНОВЛЕНИЕ ПРЕВЬЮ ПРОМПТА
// ==========================================

function updatePromptPreview() {
  const promptText = document.getElementById('prompt-text');
  if (promptText) {
    const ideaInput = document.getElementById('user-idea-input');
    const idea = ideaInput ? ideaInput.value.trim() : '';
    promptText.value = idea ? `${getPrompt()}\n\n${idea}` : getPrompt();
  }
}