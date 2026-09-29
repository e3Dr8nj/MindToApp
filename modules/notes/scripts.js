// Состояние
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let currentNoteId = null;
let autoSaveTimeout = null;

// DOM элементы
const notesList = document.getElementById('notes-list');
const editor = document.getElementById('editor');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveStatus = document.getElementById('save-status');

// Инициализация
renderNotesList();

// Создание новой заметки
document.getElementById('new-note-btn').addEventListener('click', () => {
  const note = {
    id: Date.now(),
    title: '',
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notes.unshift(note);
  saveNotes();
  openEditor(note.id);
});

// Открытие редактора
function openEditor(noteId) {
  currentNoteId = noteId;
  const note = notes.find(n => n.id === noteId);
  
  if (!note) return;
  
  noteTitle.value = note.title;
  noteContent.value = note.content;
  
  notesList.style.display = 'none';
  editor.style.display = 'block';
  
  document.getElementById('new-note-btn').style.display = 'none';
}

// Закрытие редактора
document.getElementById('close-editor-btn').addEventListener('click', () => {
  currentNoteId = null;
  editor.style.display = 'none';
  notesList.style.display = 'grid';
  document.getElementById('new-note-btn').style.display = 'block';
  renderNotesList();
});

// Автосохранение
function autoSave() {
  if (!currentNoteId) return;
  
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;
  
  note.title = noteTitle.value;
  note.content = noteContent.value;
  note.updatedAt = new Date().toISOString();
  
  saveStatus.textContent = '💾 Сохранено';
  setTimeout(() => {
    saveStatus.textContent = 'Автосохранение включено';
  }, 2000);
  
  saveNotes();
}

// Обработчики ввода с дебаунсом
noteTitle.addEventListener('input', () => {
  clearTimeout(autoSaveTimeout);
  saveStatus.textContent = '⏳ Сохранение...';
  autoSaveTimeout = setTimeout(autoSave, 500);
});

noteContent.addEventListener('input', () => {
  clearTimeout(autoSaveTimeout);
  saveStatus.textContent = '⏳ Сохранение...';
  autoSaveTimeout = setTimeout(autoSave, 500);
});

// Удаление заметки
document.getElementById('delete-note-btn').addEventListener('click', () => {
  if (!currentNoteId) return;
  
  if (confirm('Удалить эту заметку?')) {
    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    document.getElementById('close-editor-btn').click();
  }
});

// Экспорт заметок
document.getElementById('export-btn').addEventListener('click', () => {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Отрисовка списка заметок
function renderNotesList() {
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state">
        <p>У вас пока нет заметок</p>
        <button class="btn btn-primary" onclick="document.getElementById('new-note-btn').click()">
          Создать первую заметку
        </button>
      </div>
    `;
    return;
  }
  
  notesList.innerHTML = notes.map(note => `
    <div class="note-card" onclick="openEditor(${note.id})">
      <div class="note-title">${note.title || 'Без заголовка'}</div>
      <div class="note-preview">${note.content || 'Пустая заметка'}</div>
      <div class="note-date">${formatDate(note.updatedAt)}</div>
    </div>
  `).join('');
}

// Сохранение в localStorage
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Форматирование даты
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Делаем функцию глобальной для onclick
window.openEditor = openEditor;