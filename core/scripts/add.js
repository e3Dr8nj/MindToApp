function openAddModal() {
  if (!addModal) return;
  addModal.classList.add('active');
  if (moduleUrlInput) moduleUrlInput.value = '';
  selectedLocalFile = null;
  if (selectedFileName) selectedFileName.textContent = '';
  if (localFileInput) localFileInput.value = '';
  selectedFolderFiles = null;
  if (selectedFolderInfo) selectedFolderInfo.textContent = '';
  if (folderInput) folderInput.value = '';
  // Очищаем textarea для кода
  const codeTextarea = $('code-input-textarea');
  if (codeTextarea) codeTextarea.value = '';
  showStatus(modalStatus, '');
  switchTab('url');
}

function closeAddModal() { 
  if (addModal) addModal.classList.remove('active'); 
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  const activeTab = document.querySelector(`.tab[data-tab="${tab}"]`);
  if (activeTab) activeTab.style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.tab-btn[data-target="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  showStatus(modalStatus, '');
}

async function addModule() {
  if (currentTab === 'folder') await addFolderModule();
  else if (currentTab === 'local') await addLocalFileModule();
  else if (currentTab === 'code') await addCodeModule();
  else await addUrlModule();
}

async function addLocalFileModule() {
  if (!selectedLocalFile) return showStatus(modalStatus, '❌ Выберите файл', 'error');
  showStatus(modalStatus, '⏳ Чтение файла...', 'loading');
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
    allModules.push({ ...manifest, content: fileText, url: URL.createObjectURL(new Blob([fileText], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
    
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

async function addFolderModule() {
  if (!selectedFolderFiles?.length) return showStatus(modalStatus, '❌ Выберите папку', 'error');
  showStatus(modalStatus, '⏳ Чтение файлов...', 'loading');
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
    
    showStatus(modalStatus, `⏳ Загрузка ${selectedFolderFiles.length} файлов...`, 'loading');
    const files = [];
    for (const file of selectedFolderFiles) {
      const parts = file.webkitRelativePath.split('/');
      const rel = parts.slice(1).join('/');
      if (parts[parts.length - 1].toLowerCase() === 'index.html' || !rel) continue;
      files.push({ path: rel, blob: file });
    }
    
    await saveFolderModule(manifest.id, manifest, files, mainHtml);
    const customEntry = { id: manifest.id, name: manifest.name, icon: manifest.icon, description: manifest.description || 'Папка модуля', isCustom: true, isLocal: true, isFolder: true };
    customModules.push(customEntry);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    
    const vfs = createVirtualFS({ id: manifest.id, manifest, files, mainHtml });
    activeVirtualFS.set(manifest.id, vfs);
    allModules.push({ ...manifest, content: mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true });
    
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

async function addUrlModule() {
  let url = moduleUrlInput?.value.trim();
  if (!url) return showStatus(modalStatus, '❌ Введите URL', 'error');
  if (!url.startsWith('http')) url = 'https://' + url;
  if (!url.endsWith('/') && !url.endsWith('.html')) url += '/';
  showStatus(modalStatus, '⏳ Загрузка модуля...', 'loading');
  try {
    const code = await loadContentFromUrl(url);
    if (!code) throw new Error('Не удалось загрузить');
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    if (!manifestScript) throw new Error('Manifest не найден');
    const manifest = JSON.parse(manifestScript.textContent);
    if (!manifest.id || !manifest.name || !manifest.icon) throw new Error('Не все обязательные поля');
    if (allModules.some(m => m.id === manifest.id)) throw new Error('Модуль уже добавлен');
    
    const newModule = { ...manifest, description: manifest.description || 'Пользовательский модуль', content: code, url, isCustom: true, isLocal: false, isFolder: false };
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    if (!installedModules.includes(manifest.id)) { installedModules.push(manifest.id); localStorage.setItem('installedModules', JSON.stringify(installedModules)); }
    allModules.push(newModule);
    
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => { closeAddModal(); renderInstalledApps(); renderAllApps(); }, 1000);
  } catch (error) { showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error'); }
}

// НОВАЯ ФУНКЦИЯ: Добавление по прямому коду
async function addCodeModule() {
  const codeTextarea = $('code-input-textarea');
  if (!codeTextarea) return showStatus(modalStatus, '❌ Поле кода не найдено', 'error');
  
  const code = codeTextarea.value.trim();
  if (!code) return showStatus(modalStatus, '❌ Вставьте HTML-код', 'error');
  
  // Проверка что это похоже на HTML
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    return showStatus(modalStatus, '❌ Это не похоже на HTML-код', 'error');
  }
  
  showStatus(modalStatus, '⏳ Анализ кода...', 'loading');
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const manifestScript = doc.getElementById('manifest');
    
    if (!manifestScript) {
      throw new Error('Не найден тег <script id="manifest"> в <head>. Код должен содержать manifest.');
    }
    
    const manifest = JSON.parse(manifestScript.textContent);
    
    if (!manifest.id || !manifest.name || !manifest.icon) {
      throw new Error('В manifest не хватает обязательных полей: id, name или icon');
    }
    
    if (allModules.some(m => m.id === manifest.id)) {
      throw new Error(`Модуль с ID "${manifest.id}" уже существует. Измените ID в manifest.`);
    }
    
    // Создаём новый модуль
    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Добавлено из кода',
      content: code,
      isCustom: true,
      isLocal: true,
      isFolder: false
    };
    
    customModules.push(newModule);
    localStorage.setItem('customModules', JSON.stringify(customModules));
    
    if (!installedModules.includes(manifest.id)) {
      installedModules.push(manifest.id);
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
    
    const blob = new Blob([code], { type: 'text/html' });
    allModules.push({
      ...manifest,
      description: manifest.description || 'Добавлено из кода',
      content: code,
      url: URL.createObjectURL(blob),
      isCustom: true,
      isLocal: true,
      isFolder: false
    });
    
    showStatus(modalStatus, `✅ Модуль "${manifest.name}" добавлен!`, 'success');
    setTimeout(() => {
      closeAddModal();
      renderInstalledApps();
      renderAllApps();
    }, 1000);
    
  } catch (error) {
    showStatus(modalStatus, `❌ Ошибка: ${error.message}`, 'error');
  }
}

// Обработчики input для файлов
if (localFileInput) {
  localFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html')) {
      showStatus(modalStatus, '❌ Выберите файл .html', 'error');
      selectedLocalFile = null;
      if (selectedFileName) selectedFileName.textContent = '';
      return;
    }
    selectedLocalFile = file;
    if (selectedFileName) selectedFileName.textContent = `✅ Выбран: ${file.name}`;
    showStatus(modalStatus, '');
  });
}

if (folderInput) {
  folderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!files.some(f => f.webkitRelativePath.split('/').pop().toLowerCase() === 'index.html')) {
      showStatus(modalStatus, '❌ В папке должен быть index.html', 'error');
      selectedFolderFiles = null;
      if (selectedFolderInfo) selectedFolderInfo.textContent = '';
      return;
    }
    selectedFolderFiles = files;
    const root = files[0].webkitRelativePath.split('/')[0];
    const size = (files.reduce((s, f) => s + f.size, 0) / 1048576).toFixed(2);
    if (selectedFolderInfo) selectedFolderInfo.textContent = `✅ Папка: ${root} (${files.length} файлов, ${size} МБ)`;
    showStatus(modalStatus, '');
  });
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `modal-status ${type}`.trim();
}