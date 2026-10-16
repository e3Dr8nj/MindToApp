// ==========================================
// УПРАВЛЕНИЕ СПИСКОМ НЕЙРОСЕТЕЙ
// ==========================================

const DEFAULT_AI_NETWORKS = [
  { id: 'qwen',       name: 'Qwen Chat',      url: 'https://chat.qwenlm.ai',      available: true },
  { id: 'deepseek',   name: 'DeepSeek',       url: 'https://chat.deepseek.com',   available: true },
  { id: 'groq',       name: 'Groq',           url: 'https://groq.com',            available: true },
  { id: 'chatgpt',    name: 'ChatGPT',        url: 'https://chat.openai.com',     available: false },
  { id: 'gemini',     name: 'Google Gemini',  url: 'https://gemini.google.com',   available: false },
  { id: 'claude',     name: 'Claude',         url: 'https://claude.ai',           available: false },
  { id: 'perplexity', name: 'Perplexity',     url: 'https://www.perplexity.ai',   available: false },
  { id: 'lmarena',    name: 'LM Arena',       url: 'https://lmarena.ai',          available: false }
];

let aiNetworks = [];

// Защита от HTML-инъекции в пользовательских названиях/ссылках
function escAI(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// ==========================================
// ХРАНЕНИЕ
// ==========================================

function loadAINetworks() {
  try {
    const stored = localStorage.getItem('aiNetworks');
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Ошибка загрузки списка нейросетей:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_AI_NETWORKS));
}

function saveAINetworks() {
  localStorage.setItem('aiNetworks', JSON.stringify(aiNetworks));
}

// ==========================================
// ОТРИСОВКА ВО ВСЕХ МЕСТАХ ПЛАТФОРМЫ
// ==========================================

function renderSidebarAIDropdown() {
  const container = $('sidebar-ai-dropdown');
  if (!container) return;

  if (aiNetworks.length === 0) {
    container.innerHTML = '<div class="ai-dropdown-empty">Список пуст.<br>Добавьте нейросеть в разделе «🤖 ИИ».</div>';
    return;
  }

  container.innerHTML = aiNetworks.map(n => `
    <a href="${escAI(n.url)}" target="_blank" rel="noopener noreferrer"
       class="sidebar-ai-link ${n.available ? 'ai-available' : ''}"
       title="${escAI(n.name)}">
      ${n.available ? '⭐ ' : ''}${escAI(n.name)}
    </a>
  `).join('');
}

function renderAIPanelGrid() {
  const container = $('ai-panel-grid');
  if (!container) return;

  if (aiNetworks.length === 0) {
    container.innerHTML = '<p style="color: var(--description-color); grid-column: 1/-1; text-align: center;">Список нейросетей пуст.</p>';
    return;
  }

  container.innerHTML = aiNetworks.map(n => `
    <a href="${escAI(n.url)}" target="_blank" rel="noopener noreferrer"
       class="ai-panel-link ${n.available ? 'ai-available' : ''}">
      ${n.available ? '⭐ ' : ''}${escAI(n.name)}
    </a>
  `).join('');
}

function renderBuilderAISelect() {
  const select = $('builder-ai-select');
  if (!select) return;

  const previous = select.value;

  if (aiNetworks.length === 0) {
    select.innerHTML = '<option value="">Нет нейросетей</option>';
    return;
  }

  select.innerHTML = aiNetworks.map(n => `
    <option value="${escAI(n.url)}">${n.available ? '⭐ ' : ''}${escAI(n.name)}</option>
  `).join('');

  if (previous && aiNetworks.some(n => n.url === previous)) {
    select.value = previous;
  }
}

function renderAILinksContainer(containerId) {
  const container = $(containerId);
  if (!container) return;

  if (aiNetworks.length === 0) {
    container.innerHTML = '<p style="color: var(--description-color); font-size: 13px;">Список нейросетей пуст. Добавьте его через кнопку «🤖 ИИ».</p>';
    return;
  }

  container.innerHTML = aiNetworks.map(n => `
    <a href="${escAI(n.url)}" target="_blank" rel="noopener noreferrer" class="ai-link">
      ${n.available ? '⭐ ' : ''}${escAI(n.name)}
    </a>
  `).join('');
}

function renderAllAILists() {
  renderSidebarAIDropdown();
  renderAIPanelGrid();
  renderBuilderAISelect();
  renderAILinksContainer('create-ai-links');
  renderAILinksContainer('theme-ai-links');
}

// ==========================================
// МОДАЛЬНОЕ ОКНО УПРАВЛЕНИЯ
// ==========================================

function openAIManagerModal() {
  const modal = $('ai-manager-modal');
  if (!modal) return;

  renderAIManagerList();
  hideAIEditor();
  modal.classList.add('active');
}

function closeAIManagerModal() {
  const modal = $('ai-manager-modal');
  if (modal) modal.classList.remove('active');
}

function renderAIManagerList() {
  const container = $('ai-manager-list');
  if (!container) return;

  if (aiNetworks.length === 0) {
    container.innerHTML = '<p class="ai-dropdown-empty">Список пуст. Нажмите «➕ Добавить нейросеть».</p>';
    return;
  }

  container.innerHTML = aiNetworks.map((n, index) => `
    <div class="ai-manager-item">
      <div class="ai-manager-info">
        <div class="ai-manager-name">${n.available ? '⭐ ' : ''}${escAI(n.name)}</div>
        <div class="ai-manager-url">${escAI(n.url)}</div>
      </div>
      <div class="ai-manager-actions">
        <button data-action="up" data-id="${escAI(n.id)}" title="Поднять выше" ${index === 0 ? 'disabled' : ''}>↑</button>
        <button data-action="down" data-id="${escAI(n.id)}" title="Опустить ниже" ${index === aiNetworks.length - 1 ? 'disabled' : ''}>↓</button>
        <button data-action="edit" data-id="${escAI(n.id)}" title="Редактировать">✏️</button>
        <button data-action="delete" data-id="${escAI(n.id)}" title="Удалить">✕</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// РЕДАКТОР ОДНОЙ НЕЙРОСЕТИ
// ==========================================

function showAIEditor(network = null) {
  const box = $('ai-editor-box');
  if (!box) return;

  $('ai-edit-id').value = network ? network.id : '';
  $('ai-edit-name').value = network ? network.name : '';
  $('ai-edit-url').value = network ? network.url : '';
  $('ai-edit-available').checked = network ? !!network.available : false;

  $('ai-editor-title').textContent = network ? '✏️ Редактировать нейросеть' : '➕ Новая нейросеть';

  const status = $('ai-editor-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }

  box.style.display = 'block';

  setTimeout(() => {
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const nameInput = $('ai-edit-name');
    if (nameInput) nameInput.focus();
  }, 80);
}

function hideAIEditor() {
  const box = $('ai-editor-box');
  if (box) box.style.display = 'none';
}

function saveAINetworkFromForm() {
  const id = $('ai-edit-id').value;
  const name = $('ai-edit-name').value.trim();
  const url = $('ai-edit-url').value.trim();
  const available = $('ai-edit-available').checked;
  const status = $('ai-editor-status');

  if (!name) {
    if (status) { status.textContent = '❌ Введите название нейросети'; status.className = 'modal-status error'; }
    return;
  }

  if (!url) {
    if (status) { status.textContent = '❌ Введите ссылку'; status.className = 'modal-status error'; }
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (status) { status.textContent = '❌ Ссылка должна начинаться с https://'; status.className = 'modal-status error'; }
    return;
  }

  if (id) {
    const index = aiNetworks.findIndex(n => n.id === id);
    if (index > -1) {
      aiNetworks[index] = { ...aiNetworks[index], name, url, available };
    }
  } else {
    const newId = 'ai-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    aiNetworks.push({ id: newId, name, url, available });
  }

  saveAINetworks();
  renderAllAILists();
  renderAIManagerList();
  hideAIEditor();

  if (typeof showToast === 'function') showToast('✅ Список нейросетей обновлён', 'success');
}

function deleteAINetwork(id) {
  const network = aiNetworks.find(n => n.id === id);
  if (!network) return;

  if (!confirm(`Удалить «${network.name}» из списка?`)) return;

  aiNetworks = aiNetworks.filter(n => n.id !== id);
  saveAINetworks();
  renderAllAILists();
  renderAIManagerList();

  if ($('ai-edit-id') && $('ai-edit-id').value === id) hideAIEditor();

  if (typeof showToast === 'function') showToast('🗑 Нейросеть удалена', 'info');
}

function moveAINetwork(id, direction) {
  const index = aiNetworks.findIndex(n => n.id === id);
  const target = index + direction;

  if (index < 0 || target < 0 || target >= aiNetworks.length) return;

  [aiNetworks[index], aiNetworks[target]] = [aiNetworks[target], aiNetworks[index]];

  saveAINetworks();
  renderAllAILists();
  renderAIManagerList();
}

function resetAIList() {
  if (!confirm('Вернуть стандартный список нейросетей? Все ваши изменения будут удалены.')) return;

  aiNetworks = JSON.parse(JSON.stringify(DEFAULT_AI_NETWORKS));
  saveAINetworks();
  renderAllAILists();
  renderAIManagerList();
  hideAIEditor();

  if (typeof showToast === 'function') showToast('✅ Стандартный список восстановлен', 'success');
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================

function initAINetworks() {
  aiNetworks = loadAINetworks();
  renderAllAILists();

  // Делегирование событий для списка в модалке управления
  const list = $('ai-manager-list');
  if (list) {
    list.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn || btn.disabled) return;

      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === 'edit') {
        const network = aiNetworks.find(n => n.id === id);
        if (network) showAIEditor(network);
      } else if (action === 'delete') {
        deleteAINetwork(id);
      } else if (action === 'up') {
        moveAINetwork(id, -1);
      } else if (action === 'down') {
        moveAINetwork(id, 1);
      }
    };
  }

  console.log(`🤖 Загружено нейросетей: ${aiNetworks.length}`);
}