async function loadContentFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Ошибка загрузки кода с URL:', url, error);
    return null;
  }
}

function saveContentToCustomModule(moduleId, content) {
  const idx = customModules.findIndex(m => m.id === moduleId);
  if (idx !== -1) {
    customModules[idx].content = content;
    localStorage.setItem('customModules', JSON.stringify(customModules));
  }
}

async function loadRegistry() {
  const REGISTRY_URL = 'https://e3dr8nj.github.io/MindToApp/registry/registry.json';
  try {
    const response = await fetch(REGISTRY_URL);
    const data = await response.json();
    
    const registryModules = await Promise.all(
      data.modules.map(async (module) => {
        try {
          const htmlText = await loadContentFromUrl(module.url);
          if (!htmlText) return null;
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          const manifestScript = doc.getElementById('manifest');
          if (manifestScript) {
            return { ...JSON.parse(manifestScript.textContent), url: module.url, content: htmlText, isCustom: false, isLocal: false, isFolder: false };
          }
        } catch (error) { console.error('Ошибка загрузки модуля:', module.url, error); }
        return null;
      })
    );
    const validRegistryModules = registryModules.filter(m => m !== null);
    
    const restoredLocalModules = [];
    for (const m of customModules.filter(m => m.isLocal && !m.isFolder)) {
      let content = m.content;
      if (!content && m.url) {
        if (m.url.startsWith('blob:')) {
          try {
            const resp = await fetch(m.url);
            if (resp.ok) { content = await resp.text(); saveContentToCustomModule(m.id, content); }
          } catch (e) { console.warn(`Модуль ${m.id}: blob URL недоступен`); continue; }
        } else {
          content = await loadContentFromUrl(m.url);
          if (content) saveContentToCustomModule(m.id, content);
          else { console.warn(`Модуль ${m.id}: не удалось загрузить код`); continue; }
        }
      }
      if (content) {
        restoredLocalModules.push({ id: m.id, name: m.name, icon: m.icon, description: m.description, content, url: URL.createObjectURL(new Blob([content], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
      }
    }
    
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(fd => {
        const vfs = createVirtualFS(fd);
        activeVirtualFS.set(fd.id, vfs);
        return { id: fd.manifest.id, name: fd.manifest.name, icon: fd.manifest.icon, description: fd.manifest.description || 'Папка модуля', content: fd.mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
      });
    } catch (error) { console.error(error); }
    
    allModules = [...validRegistryModules, ...restoredLocalModules, ...restoredFolderModules];
    
    const validIds = new Set(allModules.map(m => m.id));
    const brokenIds = installedModules.filter(id => !validIds.has(id));
    if (brokenIds.length > 0) {
      installedModules = installedModules.filter(id => validIds.has(id));
      localStorage.setItem('installedModules', JSON.stringify(installedModules));
    }
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    // Fallback
    const restoredLocalModules = [];
    for (const m of customModules.filter(m => m.isLocal && !m.isFolder)) {
      let content = m.content;
      if (!content && m.url && !m.url.startsWith('blob:')) {
        content = await loadContentFromUrl(m.url);
        if (content) saveContentToCustomModule(m.id, content);
      }
      if (content) restoredLocalModules.push({ ...m, content, url: URL.createObjectURL(new Blob([content], { type: 'text/html' })), isCustom: true, isLocal: true, isFolder: false });
    }
    let restoredFolderModules = [];
    try {
      const folderModulesData = await getAllFolderModules();
      restoredFolderModules = folderModulesData.map(fd => {
        const vfs = createVirtualFS(fd);
        activeVirtualFS.set(fd.id, vfs);
        return { ...fd.manifest, description: fd.manifest.description || 'Папка модуля', content: fd.mainHtml, url: vfs.url, isCustom: true, isLocal: true, isFolder: true };
      });
    } catch (e) { console.error(e); }
    allModules = [...restoredLocalModules, ...restoredFolderModules];
  }
}