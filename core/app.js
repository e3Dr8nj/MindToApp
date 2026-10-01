const REGISTRY_URL = 'https://e3dr8nj.github.io/NexusAl/registry/registry.json';

let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');
let customModules = JSON.parse(localStorage.getItem('customModules') || '[]');
let currentTab = 'url';
let selectedLocalFile = null;
let selectedFolderFiles = null;
let selectedFolderName = '';
const activeVirtualFS = new Map();

const homeScreen = document.getElementById('home-screen');
const storeScreen = document.getElementById('store-screen');
const appScreen = document.getElementById('app-screen');
const installedAppsContainer = document.getElementById('installed-apps');
const allAppsContainer = document.getElementById('all-apps');
const emptyState = document.getElementById('empty-state');
const currentAppName = document.getElementById('current-app-name');
const appFrame = document.getElementById('app-frame');
const addModal = document.getElementById('add-modal');
const moduleUrlInput = document.getElementById('module-url-input');
const modalStatus = document.getElementById('modal-status');
const localFileInput = document.getElementById('local-file-input');
const selectedFileName = document.getElementById('selected-file-name');
const folderInput = document.getElementById('folder-input');
const selectedFolderInfo = document.getElementById('selected-folder-info');
const promptModal = document.getElementById('prompt-modal');

async function init() {
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
}

async function loadRegistry() {
  try {
    const response = await fetch(REGISTRY_URL);
    const data = await response.json();
    const registryModules = await Promise.all(
      data.modules.map(async (module) => {
        try {
          const htmlResponse = await fetch(module.url);
          if (!htmlResponse.ok) throw new Error(`HTTP ${htmlResponse.status}`);
          const htmlText = await htmlResponse.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          const manifestScript = doc.getElementById('manifest');
          if (manifestScript) {
            return { ...JSON.parse(manifestScript.textContent), url: module.url, isCustom: false, isLocal: false, isFolder: false };
          }
        } catch (error) {
          console.error('Ошибка загрузки модуля:', module.url, error);
        }
        return null;
      })
    );
    const validRegistryModules = registryModules.filter(m => m !== null);
    const restoredLocalModules = customModules.filter(m => m.isLocal && !m.isFolder).map(m => {
      const blob = new Blob([m.content], { type: 'text/html' });
      return { id: m.id, name: m.name, icon: m.icon, description: m.description, url: URL.createObjectURL(blob), isCustom: true, isLocal: true, isFolder: false };
    });
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(folderData => {
        const vfs = createVirtualFS(folderData);
        activeVirtualFS.set(folderData.id, vfs);
        return { id: folderData.manifest.id, name: folderData.manifest.name, icon: folderData.manifest.icon, description: folderData.manifest.description || 'Папка модуля', url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
      });
    } catch (error) { console.error(error); }
    allModules = [...validRegistryModules, ...restoredLocalModules, ...restoredFolderModules];
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    const restoredLocalModules = customModules.filter(m => m.isLocal && !m.isFolder).map(m => {
      const blob = new Blob([m.content], { type: 'text/html' });
      return { ...m, url: URL.createObjectURL(blob), isCustom: true, isLocal: true, isFolder: false };
    });
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(folderData => {
        const vfs = createVirtualFS(folderData);
        activeVirtualFS.set(folderData.id, vfs);
        return { ...folderData.manifest, description: folderData.manifest.description || 'Папка модуля', url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
      });
    } catch (e) { console.error(e); }
    allModules = [...restoredLocalModules, ...restoredFolderModules];
  }
}

function renderInstalledApps() {
  installedAppsContainer.innerHTML = '';
  if (installedModules.length === 0) {
    emptyState.style.display = 'block';
    installedAppsContainer.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  installedAppsContainer.style.display = 'grid';
  installedModules.forEach(moduleId => {
    const module = allModules.find(m => m.id === moduleId);
    if (module) {
      const card = createAppCard(module, true);
      installedAppsContainer.appendChild(card);
    }
  });
}

function renderAllApps() {
  allAppsContainer.innerHTML = '';
  if (allModules.length === 0) {
    allAppsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Нет доступных модулей</p>';
    return;
  }
  allModules.forEach(module => {
    const card = createAppCard(module, false);
    allAppsContainer.appendChild(card);
  });
}

function createAppCard(module, isInstalled) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.innerHTML = `<div class="app-icon">${module.icon}</div><div class="app-name">${module.name}</div><div class="app-description">${module.description}</div>`;
  if (!isInstalled) {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.textContent = installedModules.includes(module.id) ? 'Удалить' : 'Установить';
    if (installedModules.includes(module.id)) installBtn.classList.add('installed');
    installBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleInstall(module.id); });
    card.appendChild(installBtn);
  } else {
    card.addEventListener('click', () => openApp(module));
  }
  if (module.isCustom) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Удалить модуль';
    deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); removeCustomModule(module.id); });
    card.appendChild(deleteBtn);
  }
  return card;
}

function toggleInstall(moduleId) {
  const index = installedModules.indexOf(moduleId);
  if (index > -1) installedModules.splice(index, 1);
  else installedModules.push(moduleId);
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  renderInstalledApps();
  renderAllApps();
}

async function removeCustomModule(moduleId) {
  if (!confirm('Удалить этот модуль?')) return;
  const module = allModules.find(m => m.id === moduleId);
  if (module && module.isFolder) {
    try {
      await deleteFolderModule(moduleId);
      if (activeVirtualFS.has(moduleId)) { activeVirtualFS.get(moduleId).cleanup(); activeVirtualFS.delete(moduleId); }
    } catch (error) { console.error(error); }
  }
  customModules = customModules.filter(m => m.id !== moduleId);
  installedModules = installedModules.filter(id => id !== moduleId);
  localStorage.setItem('customModules', JSON.stringify(customModules));
  localStorage.setItem('installedModules', JSON.stringify(installedModules));
  allModules = allModules.filter(m => m.id !== moduleId);
  renderInstalledApps();
  renderAllApps();
}

function openApp(module) {
  currentAppName.textContent = module.name;
  appFrame.src = module.url;
  showScreen(appScreen);
}

function closeApp() {
  appFrame.src = 'about:blank';
  showScreen(homeScreen);
}

function showScreen(screen) {
  [homeScreen, storeScreen, appScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// --- Промпт модалка ---
function openPromptModal() {
  promptModal.classList.add('active');
}

function closePromptModal() {
  promptModal.classList.remove('active');
}

function copyPrompt() {
  const promptText = document.getElementById('prompt-text');
  const copyBtn = document.getElementById('copy-prompt-btn');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(promptText.value).then(() => {
      copyBtn.textContent = '✅ Скопировано!';
      setTimeout(() => copyBtn.textContent = '📋 Копировать', 2000);
    });
  } else {
    promptText.select();
    document.execCommand('copy');
    copyBtn.textContent = '✅ Скопировано!';
    setTimeout(() => copyBtn.textContent = '📋 Копировать', 2000);
  }
}

// --- Добавить модуль модалка ---
function openAddModal() {
  addModal.classList.add('active');
  moduleUrlInput.value = '';
  selectedLocalFile = null;
  selectedFileName.textContent = '';
  localFileInput.value = '';
  selectedFolderFiles = null;
  selectedFolderName = '';
  selectedFolderInfo.textContent = '';
  folderInput.value = '';
  modalStatus.textContent = '';
  modalStatus.className = 'modal-status';
  switchTab('url');
}

function closeAddModal() { addModal.classList.remove('active'); }

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.querySelector(`.tab[data-tab="${tab}"]`).style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-target="${tab}"]`).classList.add('active');
  modalStatus.textContent = '';
}

localFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.html')) {
    modalStatus.textContent = '❌ Выберите файл .html';
    modalStatus.className = 'modal-status error';
    selectedLocalFile = null;
    selectedFileName.textContent = '';
    return;
  }
  selectedLocalFile = file;
  selectedFileName.textContent = `✅ Выбран: ${file.name}`;
  modalStatus.textContent = '';
});

folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  const indexFile = files.find(f => {
    const parts = f.webkitRelativePath.split('/');
    return parts[parts.length - 1].toLowerCase() === 'index.html';
  });
  if (!indexFile) {
    modalStatus.textContent = '❌ В папке должен быть файл index.html';
    modalStatus.className = 'modal-status error';
    selectedFolderFiles = null;
    selectedFolderInfo.textContent = '';
    return;
  }
  const rootFolder = indexFile.webkitRelativePath.split('/')[0];
  selectedFolderName = rootFolder;
  selectedFolderFiles = files;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  selectedFolderInfo.textContent = `✅ Папка: ${rootFolder} (${files.length} файлов, ${(totalSize / 1048576).toFixed(2)} МБ)`;
  modalStatus.textContent = '';
});

async function addModule() {
  if (currentTab === 'folder') await addFolderModule();
  else if (currentTab === 'local') await addLocalFileModule();
  else await addUrlModule();
}

async function addLocalFileModule() {
  if (!selectedLocalFile) { modalStatus.textContent = '❌ Выберите файл'; modalStatus.className = 'modal-status error'; return; }
  modalStatus.textContent = '⏳ Чтение файла...'; modalStatus.className = 'modal-status loading';
  try {
    const fileText = await selectedLocalFile.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(fileText, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    const newModule = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Локальный модуль', content: fileText, isCustom: true, isLocal: true, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    const blob = new Blob([fileText], { type: 'text/html' });
    allModules.push({ ...manifest, url: URL.createObjectURL(blob), isCustom: true, isLocal: true, isFolder: false });
    modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success';
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; }
}

async function addFolderModule() {
  if (!selectedFolderFiles || !selectedFolderFiles.length) { modalStatus.textContent = '❌ Выберите папку'; modalStatus.className = 'modal-status error'; return; }
  modalStatus.textContent = '⏳ Чтение файлов...'; modalStatus.className = 'modal-status loading';
  try {
    const indexFile = selectedFolderFiles.find(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html');
    if (!indexFile) throw new Error('index.html не найден');
    const mainHtml = await indexFile.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(mainHtml, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    modalStatus.textContent = `⏳ Загрузка ${selectedFolderFiles.length} файлов...`;
    const files = [];
    for (const file of selectedFolderFiles) {
      const parts = file.webkitRelativePath.split('/');
      const relativePath = parts.slice(1).join('/');
      if (parts[parts.length - 1].toLowerCase() === 'index.html' || !relativePath) continue;
      files.push({ path: relativePath, blob: file });
    }
    await saveFolderModule(manifest.id, manifest, files, mainHtml);
    const customEntry = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Папка модуля', isCustom: true, isLocal: true, isFolder: true };
    customModules.push(customEntry);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    const folderData = { id: manifest.id, manifest, files, mainHtml };
    const vfs = createVirtualFS(folderData);
    activeVirtualFS.set(manifest.id, vfs);
    allModules.push({ ...manifest, url: vfs.url, isCustom: true, isLocal: true, isFolder: true });
    modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success';
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; }
}

async function addUrlModule() {
  let url = moduleUrlInput.value.trim();
  if (!url) { modalStatus.textContent = '❌ Введите URL'; modalStatus.className = 'modal-status error'; return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
  if (!url.endsWith('/') && !url.endsWith('.html')) url += '/';
  modalStatus.textContent = '⏳ Загрузка модуля...'; modalStatus.className = 'modal-status loading';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    const newModule = { ...manifest, description: manifest.description || 'Пользовательский модуль', url, isCustom: true, isLocal: false, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    allModules.push(newModule);
    modalStatus.textContent = `✅ Модуль "${manifest.name}" добавлен!`; modalStatus.className = 'modal-status success';
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { modalStatus.textContent = `❌ Ошибка: ${error.message}`; modalStatus.className = 'modal-status error'; }
}

function setupEventListeners() {
  document.getElementById('open-store-btn').addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  document.getElementById('back-to-home-btn').addEventListener('click', () => showScreen(homeScreen));
  document.getElementById('go-to-store-btn').addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  document.getElementById('close-app-btn').addEventListener('click', closeApp);

  // Промпт модалка
  document.getElementById('prompt-btn').addEventListener('click', openPromptModal);
  document.getElementById('close-prompt-btn').addEventListener('click', closePromptModal);
  document.getElementById('close-prompt-footer-btn').addEventListener('click', closePromptModal);
  document.getElementById('copy-prompt-btn').addEventListener('click', copyPrompt);
  promptModal.addEventListener('click', (e) => { if (e.target === promptModal) closePromptModal(); });

  // Добавить модуль модалка
  document.getElementById('add-custom-btn').addEventListener('click', openAddModal);
  document.getElementById('add-custom-btn-store').addEventListener('click', openAddModal);
  document.getElementById('close-modal-btn').addEventListener('click', closeAddModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeAddModal);
  document.getElementById('confirm-add-btn').addEventListener('click', addModule);
  addModal.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
  moduleUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addModule(); });
  document.getElementById('select-file-btn').addEventListener('click', () => localFileInput.click());
  document.getElementById('select-folder-btn').addEventListener('click', () => folderInput.click());
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Escape закрывает любую модалку
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closePromptModal(); closeAddModal(); }
  });
}

init();