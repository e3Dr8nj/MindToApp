```markdown
# 🐹 MindToApp Platform

**Локальная PWA-платформа для создания, управления и запуска HTML-приложений с помощью нейросетей.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]() [![License](https://img.shields.io/badge/license-MIT-green.svg)]() [![No Backend](https://img.shields.io/badge/backend-none-orange.svg)]()

## 📖 О проекте

MindToApp работает полностью в браузере без сервера. Данные хранятся в `localStorage` и `IndexedDB`, а файлы управляются через File System Access API.

**Основные возможности:**
- 🤖 **AI-конструктор** — пошаговое создание приложений через промпты
- 📦 **Управление** — установка, редактирование, удаление, скачивание HTML
- 📤 **Экспорт/Импорт** — массовое сохранение и загрузка из папок с проверкой по `manifest.id`
- 🎨 **Темы** — Light, Cyberpunk, Discord + создание своих тем через AI
- 🌐 **Локализация** — полный перевод на EN и RU
- 📱 **PWA** — установка на рабочий стол в режиме `standalone`

## 🚀 Быстрый старт

**Локальный запуск:** Открой `core/index.html` в браузере (Chrome/Edge) или через Live Server в VS Code.

**Публикация (бесплатно):**
- **GitHub Pages**: Settings → Pages → Branch: `main` → Save
- **Netlify Drop**: перетащи папку `core` на [app.netlify.com/drop](https://app.netlify.com/drop)

## 📖 Как пользоваться

**Создание приложения:**
1. Нажми **🛠 Builder** → опиши идею
2. Нажми **📋 Copy prompt** → **🌐 Open AI**
3. Вставь промпт в нейросеть, скопируй полученный HTML
4. Вставь HTML в конструктор и нажми **🚀 Create app**

*Альтернатива: кнопка 🚀 Create в сайдбаре читает HTML из буфера обмена.*

**Добавление приложений (кнопка ➕ Add):**
- **🔗 Link** — прямая ссылка на .html или GitHub Gist
- **📄 File** — выбор одного .html файла
- **📁 Folder** — выбор папки с `index.html`
- **📋 Code** — вставка HTML-кода вручную

**Экспорт и Импорт (кнопки в сайдбаре):**
- **📤 Export** — сохраняет все установленные приложения в папку как `Name_ID.html`
- **📥 Import** — сканирует папку, игнорирует дубликаты по `manifest.id`, автоматически создаёт manifest, если его нет

**Контекстное меню (⚙️ на карточке):**
ℹ️ Info | 🚀 Open | ✏️ Edit | 📤 Share | 📥 Download HTML | 🗑 Delete

## 🏗 Структура проекта

```text
core/
├── index.html              # Главная страница
├── manifest.json           # PWA манифест (display: standalone)
├── styles.css              # Основные стили + адаптивность
├── styles/themes/          # light.css, cyberpunk.css, discord.css
└── scripts/
    ├── app-factory.js      # 🎯 Ядро: создание приложения из HTML
    ├── render.js           # Отрисовка карточек и контекстного меню
    ├── import.js           # Импорт из папки
    ├── export.js           # Экспорт в папку
    ├── i18n.js             # Переводы (EN/RU)
    ├── add.js              # Добавление модулей (URL/File/Folder/Code)
    ├── create.js           # Модалка создания
    ├── edit.js             # Редактирование
    ├── share.js            # Шеринг приложений
    ├── theme.js            # Управление темами
    ├── ai-list.js          # Список AI-сетей
    └── app-events.js       # Обработчики событий
```

## 🔧 Технические детали

**Требования к HTML-приложению:**

Должен содержать в `<head>`:
```html
<script type="application/json" id="manifest">
{"id": "app-123456", "name": "My App", "icon": "🚀", "description": "Desc"}
</script>
```

*Если `manifest` отсутствует, `app-factory.js` сгенерирует его автоматически с уникальным ID.*

**Безопасность:**

Приложения запускаются в `<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads allow-popups">`. Это блокирует `alert()`/`confirm()`, но разрешает `localStorage` и `fetch`.

**Совместимость:**

| Функция | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Основной интерфейс | ✅ | ✅ | ✅ | ✅ |
| Создание приложений | ✅ | ✅ | ✅ | ✅ |
| Экспорт/Импорт папок | ✅ | ✅ | ❌ | ❌ |
| PWA установка | ✅ | ✅ | ✅ | ✅ |

## ❓ FAQ

**Почему приложение не создаётся?**
Проверь: 1) Это валидный HTML? 2) Нет ли дубликата `manifest.id`? 3) Есть ли поля `id`, `name`, `icon`?

**Как очистить все данные?**
Открой консоль (F12) и выполни:
```javascript
localStorage.clear();
indexedDB.deleteDatabase('MindToAppExportDB');
indexedDB.deleteDatabase('MindToAppImportDB');
location.reload();
```

**Как добавить свою нейросеть?**
Нажми **🤖 AI** в хедере → **➕ Add AI** → введи Название и URL → **💾 Save**.

**Как изменить промпт для AI?**
Нажми **⚙️ Prompt** в хедере → отредактируй → **💾 Save changes**.

## 🛠 Разработка

**Локальный сервер (рекомендуется):**
```bash
# Через Python
cd core && python -m http.server 8000

# Через Node.js
npx serve core

# Через VS Code
# Установи "Live Server" → правый клик на index.html → "Open with Live Server"
```

**Внесение изменений:**
```bash
git checkout -b feature/my-feature
# ... изменения ...
git add .
git commit -m "feat: описание изменений"
git push origin feature/my-feature
```

## 📄 Лицензия

MIT License — используй, изменяй, распространяй свободно.



