// ==========================================
// ПРОМПТ-ИНСТРУКЦИИ
// ==========================================

// Все стандартные промпты собраны в одном объекте
const PROMPTS = {
  BASE_PROMPT: `Создай одностраничное веб-приложение в одном файле index.html для платформы MindToApp.

Требования:
- Manifest в <head>: <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>
- ВАЖНО: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915"). Это нужно для уникальности.
- CSS в <style>, JS в <script>, без внешних библиотек
- Адаптивный дизайн: работает на десктопе и мобильных
- body { min-height: calc(100vh - 60px); margin: 0; }
- Без alert/confirm/prompt (заблокированы в iframe)
- Картинки/звуки только в Base64

Задача: `,

  BUILDER_PLATFORM_INSTRUCTION: `

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`,

  EDIT_PROMPT_INSTRUCTION: `КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА ПЛАТФОРМЫ:
1. Формат: Верни ТОЛЬКО полный, готовый к использованию код одного файла index.html, обернутый в один единый блок кода markdown (\`\`\`html ... \`\`\`). НЕ сокращай код, НЕ пиши "...остальной код без изменений". HTML текст должен быть предоставлен целиком, от <!DOCTYPE html> до </html>, чтобы его было максимально удобно скопировать одной кнопкой.
2. Manifest: В <head> должен быть <script type="application/json" id="manifest">{"id":"...", "name":"...", "icon":"эмодзи", "description":"..."}</script>. Если в значении name в конце есть v и номер после, то увеличь номер версии, если такого нет, поставь v1 в конце.
3. Уникальный ID: К значению поля "id" в manifest ОБЯЗАТЕЛЬНО добавь 6 случайных цифр (например: "calculator-482915", "notes-739201"). Это нужно для уникальности.
4. Стили и скрипты: Весь CSS должен быть внутри <style>, весь JS внутри <script>. Никаких внешних библиотек или CDN.
5. Адаптивность: body { min-height: calc(100vh - 60px); margin: 0; }. Приложение должно работать на десктопе и мобильных.
6. Запреты: Никаких alert(), confirm(), prompt() (они блокируются в iframe). Картинки/звуки только в Base64.

Верни ТОЛЬКО полный HTML-код в одном блоке markdown. НЕ добавляй пояснений текстом.`,

  THEME_TEMPLATE: `/* ШАБЛОН ТЕМЫ ДЛЯ MindToApp */
/* Отредактируй цвета и верни ПОЛНЫЙ CSS без изменений структуры */

body[data-theme="НАЗВАНИЕ_ТЕМЫ"] {
  --bg-gradient-start: #667eea;
  --bg-gradient-end: #764ba2;
  --text-color: #333;
  --heading-color: white;
  --card-bg: white;
  --card-shadow: rgba(0, 0, 0, 0.1);
  --card-shadow-hover: rgba(0, 0, 0, 0.2);
  --btn-bg: rgba(255, 255, 255, 0.2);
  --btn-hover-bg: rgba(255, 255, 255, 0.3);
  --btn-primary-bg: white;
  --btn-primary-color: #667eea;
  --btn-primary-hover-bg: #f0f0f0;
  --btn-secondary-bg: #e0e0e0;
  --btn-secondary-color: #333;
  --btn-secondary-hover-bg: #d0d0d0;
  --description-color: #666;
  --app-header-bg: white;
  --app-header-shadow: rgba(0, 0, 0, 0.15);
  --app-header-text: #333;
  --modal-bg: white;
  --modal-shadow: rgba(0, 0, 0, 0.3);
  --modal-heading-color: #333;
  --modal-close-color: #999;
  --modal-close-hover-bg: #f5f5f5;
  --modal-close-hover-color: #333;
  --modal-description-color: #666;
  --input-border: #e0e0e0;
  --input-focus-border: #667eea;
  --code-bg: #1e1e2e;
  --code-text: #cdd6f4;
  --code-input-bg: #f8f9fa;
  --code-input-border: #cbd5e1;
  --code-input-text: #333;
  --tab-bg: #f0f0f0;
  --tab-active-bg: white;
  --tab-active-color: #667eea;
  --tab-color: #666;
  --tab-hover-color: #333;
  --ai-link-bg: #f0f4ff;
  --ai-link-color: #667eea;
  --ai-link-hover-bg: #667eea;
  --ai-link-hover-color: white;
  --ai-link-hover-shadow: rgba(102, 126, 234, 0.3);
  --edit-preview-bg: #f0f4ff;
  --edit-preview-name-color: #333;
  --edit-preview-desc-color: #666;
  --status-error-bg: #fee;
  --status-error-color: #c33;
  --status-success-bg: #efe;
  --status-success-color: #3c3;
  --status-loading-bg: #eef;
  --status-loading-color: #667eea;
  --folder-warning-bg: #fff3cd;
  --folder-warning-color: #856404;
  --accent-color: #667eea;
  --accent-hover: #5568d3;
  --delete-btn-bg: #e74c3c;
  --edit-btn-bg: #667eea;
  --share-btn-bg: #2ecc71;
  --share-btn-hover-bg: #27ae60;
  --btn-back-bg: #667eea;
  --btn-back-hover-bg: #5568d3;
  --btn-back-shadow: rgba(102, 126, 234, 0.3);
  --toast-success-bg: #2ecc71;
  --toast-error-bg: #e74c3c;
  --toast-info-bg: #667eea;
}`
};

// Определения промптов для UI редактора
const PROMPT_DEFINITIONS = {
  'BASE_PROMPT': { 
    name: '📝 Базовый промпт', 
    desc: 'Основная инструкция, которая отправляется ИИ вместе с идеей приложения.' 
  },
  'BUILDER_PLATFORM_INSTRUCTION': { 
    name: '🏗 Инструкция конструктора', 
    desc: 'Строгие технические правила платформы, добавляемые к базовому промпту.' 
  },
  'EDIT_PROMPT_INSTRUCTION': { 
    name: '✏️ Инструкция редактирования', 
    desc: 'Правила, которые добавляются к коду при запросе на изменение приложения.' 
  },
  'THEME_TEMPLATE': { 
    name: '🎨 Шаблон темы', 
    desc: 'CSS-шаблон с переменными, который отправляется ИИ для генерации новых цветовых схем.' 
  }
};

// Функция для получения промпта с поддержкой пользовательских версий
function getPrompt(promptName) {
  const customPrompts = JSON.parse(localStorage.getItem('customPrompts') || '{}');
  // Сначала ищем в пользовательских, потом в стандартных (объект PROMPTS)
  return customPrompts[promptName] || PROMPTS[promptName] || '';
}

// Функция для сохранения пользовательского промпта
function saveCustomPrompt(promptName, promptText) {
  const customPrompts = JSON.parse(localStorage.getItem('customPrompts') || '{}');
  customPrompts[promptName] = promptText;
  localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
}

// Функция для сброса промпта к стандартному
function resetPrompt(promptName) {
  const customPrompts = JSON.parse(localStorage.getItem('customPrompts') || '{}');
  delete customPrompts[promptName];
  localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
}

// Функция для получения всех пользовательских промптов
function getAllCustomPrompts() {
  return JSON.parse(localStorage.getItem('customPrompts') || '{}');
}