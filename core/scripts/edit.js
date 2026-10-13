// ==========================================
// РЕДАКТИРОВАНИЕ ПРИЛОЖЕНИЯ (КОПИРОВАНИЕ)
// ==========================================

const EDIT_PROMPT_INSTRUCTION = `КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>. Если в значении name в конце есть v и номер после, то увеличь номер версии, если такого нет, поставь v1  в конце.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`;

// ГЛАВНАЯ ФУНКЦИЯ: Копирование кода + инструкции прямо из карточки
function copyCodeWithInstruction(module, buttonElement) {
  if (!module || !module.content) {
    console.error('Нет кода для копирования');
    return;
  }
  
  // Сначала код, потом инструкция
  const fullPrompt = module.content + '\n\n' + EDIT_PROMPT_INSTRUCTION;
  
  const onSuccess = () => {
    if (buttonElement) {
      const originalText = buttonElement.textContent;
      buttonElement.textContent = '✅';
      buttonElement.title = 'Скопировано!';
      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.title = 'Редактировать';
      }, 2000);
    }
  };

  const onError = (err) => {
    console.error('Ошибка копирования:', err);
    alert('❌ Не удалось скопировать код');
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPrompt).then(onSuccess).catch(onError);
  } else {
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = fullPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (e) {
      onError(e);
    }
    document.body.removeChild(textarea);
  }
}