// ==========================================
// СПИСОК НЕЙРОСЕТЕЙ ПО УМОЛЧАНИЮ
// ==========================================

const DEFAULT_AI_NETWORKS = [
  {
    id: 'qwen',
    name: 'Qwen Chat',
    url: 'https://chat.qwenlm.ai'
  },
  {
    id: 'grok',
    name: 'Grok',
    url: 'https://grok.com'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com'
  },
  {
    id: 'arena',
    name: 'AI Arena',
    url: 'https://arena.ai/'
  },
  {
    id: 'yandex',
    name: 'YandexGPT',
    url: 'https://ya.ru/ai'
  },
  {
    id: 'gigachat',
    name: 'GigaChat',
    url: 'https://gigachat.devices.sberbank.ru'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com'
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai'
  }
];

// ==========================================
// ФУНКЦИИ УПРАВЛЕНИЯ СПИСКОМ
// ==========================================

function initAINetworks() {
  const stored = localStorage.getItem('aiNetworks');
  if (!stored) {
    localStorage.setItem('aiNetworks', JSON.stringify(DEFAULT_AI_NETWORKS));
  }
}

function getAINetworks() {
  const stored = localStorage.getItem('aiNetworks');
  return stored ? JSON.parse(stored) : DEFAULT_AI_NETWORKS;
}

function saveAINetworks(networks) {
  localStorage.setItem('aiNetworks', JSON.stringify(networks));
}

function resetAINetworks() {
  localStorage.removeItem('aiNetworks');
  return DEFAULT_AI_NETWORKS;
}

// ==========================================
// ОТРИСОВКА СПИСКА В ИНТЕРФЕЙСЕ
// ==========================================

function renderAINetworksList() {
  const listContainer = document.getElementById('ai-manager-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';
  const networks = getAINetworks();

  if (networks.length === 0) {
    listContainer.innerHTML = '<div class="ai-dropdown-empty">Список пуст</div>';
    return;
  }

  networks.forEach((network, index) => {
    const item = document.createElement('div');
    item.className = 'ai-manager-item';
    item.innerHTML = `
      <div class="ai-manager-info">
        <div class="ai-manager-name">${escapeHtml(network.name)}</div>
        <div class="ai-manager-url">${escapeHtml(network.url)}</div>
      </div>
      <div class="ai-manager-actions">
        <button data-action="edit" data-index="${index}" title="Редактировать">✏️</button>
        <button data-action="delete" data-index="${index}" title="Удалить" ${networks.length <= 1 ? 'disabled' : ''}>🗑</button>
      </div>
    `;
    listContainer.appendChild(item);
  });

  // Обработчики кнопок
  listContainer.querySelectorAll('button[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      showAIEditor(networks[index]);
    });
  });

  listContainer.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      if (confirm(`Удалить нейросеть "${networks[index].name}"?`)) {
        networks.splice(index, 1);
        saveAINetworks(networks);
        renderAINetworksList();
        initAINetworksInUI();
      }
    });
  });
}

function initAINetworksInUI() {
  // 1. Заполняем select в конструкторе
  const selectEl = document.getElementById('builder-ai-select');
  if (selectEl) {
    selectEl.innerHTML = '';
    const networks = getAINetworks();
    networks.forEach(network => {
      const option = document.createElement('option');
      option.value = network.url;
      option.textContent = network.name;
      selectEl.appendChild(option);
    });
  }

  // 2. Заполняем выпадающий список в сайдбаре
  const dropdown = document.getElementById('sidebar-ai-dropdown');
  if (dropdown) {
    dropdown.innerHTML = '';
    const networks = getAINetworks();
    networks.forEach(network => {
      const link = document.createElement('a');
      link.href = network.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'sidebar-ai-link';
      link.textContent = network.name;
      dropdown.appendChild(link);
    });
  }
}

function openAIManagerModal() {
  renderAINetworksList();
  hideAIEditor();
  const modal = document.getElementById('ai-manager-modal');
  if (modal) modal.classList.add('active');
}

function closeAIManagerModal() {
  const modal = document.getElementById('ai-manager-modal');
  if (modal) modal.classList.remove('active');
  hideAIEditor();
}

function hideAIEditor() {
  const editorBox = document.getElementById('ai-editor-box');
  if (editorBox) editorBox.style.display = 'none';
  const status = document.getElementById('ai-editor-status');
  if (status) { status.textContent = ''; status.className = 'modal-status'; }
}