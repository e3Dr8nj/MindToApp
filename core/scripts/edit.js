// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ
// ==========================================

const EDIT_PROMPT_INSTRUCTION = `КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`;

// Копирование кода + инструкции сразу из карточки
function copyCodeWithInstruction(module, buttonElement) {
  if (!module || !module.content) {
    alert('Не удалось получить код приложения');
    return;
  }
  
  const fullPrompt = EDIT_PROMPT_INSTRUCTION + '\n\n' + module.content;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      // Визуальная обратная связь
      if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✅';
        buttonElement.title = 'Скопировано!';
        setTimeout(() => {
          buttonElement.textContent = originalText;
          buttonElement.title = 'Редактировать';
        }, 2000);
      }
    }).catch(() => {
      alert('❌ Не удалось скопировать');
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
      if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✅';
        buttonElement.title = 'Скопировано!';
        setTimeout(() => {
          buttonElement.textContent = originalText;
          buttonElement.title = 'Редактировать';
        }, 2000);
      }
    } catch (e) {
      alert('❌ Не удалось скопировать');
    }
    document.body.removeChild(textarea);
  }
}