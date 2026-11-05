// ==========================================
// РАБОТА С БУФЕРОМ ОБМЕНА И URL
// Загрузка по ссылке, gist, создание из буфера,
// обработка URL, экран буфера обмена
// ==========================================

function convertGistToRaw(url) {
  if (url.includes('gist.github.com') && !url.includes('gist.githubusercontent.com')) {
    return url.replace('gist.github.com', 'gist.githubusercontent.com').replace(/\/?$/, '/raw');
  }
  if (url.includes('gist.githubusercontent.com') && !url.includes('/raw')) {
    return url.replace(/\/?$/, '/raw');
  }
  return url;
}

async function loadHTMLFromURL(url) {
  const finalUrl = convertGistToRaw(url);
  const response = await fetch(finalUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();

  if (!html.includes('<html') && !html.includes('<!DOCTYPE') && !html.includes('<script id="manifest"')) {
    throw new Error(t('noHtmlAtUrl'));
  }
  return html;
}

async function createFromClipboard() {
  const createBtn = document.getElementById('sidebar-create-btn');

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast(t('browserNotSupported'), 'error');
    return;
  }

  try {
    if (createBtn) {
      createBtn.textContent = '⏳';
      createBtn.disabled = true;
    }

    showToast(t('reading'), 'info', 2000);
    const clipboardContent = await navigator.clipboard.readText();

    if (!clipboardContent || !clipboardContent.trim()) {
      showToast(t('emptyClipboard'), 'error');
      return;
    }

    let trimmedContent = clipboardContent.trim();
    let trimmedCode = trimmedContent;

    if (trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')) {
      showToast(t('loadingByUrl'), 'info', 2000);
      try {
        trimmedCode = await loadHTMLFromURL(trimmedContent);
        showToast(t('codeLoaded'), 'success', 2000);
      } catch (loadError) {
        console.error('Link load error:', loadError);
        showToast(t('loadFailed', { message: loadError.message }), 'error');
        return;
      }
    }

    if (!trimmedCode.includes('<html') && !trimmedCode.includes('<!DOCTYPE')) {
      showToast(t('noHtml'), 'error');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmedCode, 'text/html');
    const manifestScript = doc.getElementById('manifest');

    if (!manifestScript) {
      showToast(t('noManifest'), 'error');
      return;
    }

    const manifest = JSON.parse(manifestScript.textContent);

    if (!manifest.id || !manifest.name || !manifest.icon) {
      showToast(t('missingFields'), 'error');
      return;
    }

    if (allModules.some(m => m.id === manifest.id)) {
      showToast(t('appExists'), 'error');
      return;
    }

    const newModule = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      description: manifest.description || 'Created from clipboard',
      content: trimmedCode,
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

    allModules.push({
      ...manifest,
      content: trimmedCode,
      url: URL.createObjectURL(new Blob([trimmedCode], { type: 'text/html' })),
      isCustom: true,
      isLocal: true,
      isFolder: false
    });

    showToast(t('appCreated', { name: manifest.name }), 'success', 3000);
    renderInstalledApps();
    renderAllApps();

  } catch (error) {
    console.error('Clipboard creation error:', error);
    showToast(`❌ ${error.message}`, 'error');
  } finally {
    if (createBtn) {
      createBtn.innerHTML = t('create');
      createBtn.disabled = false;
    }
  }
}

async function handleUrlFromClipboard() {
  const urlBtn = document.getElementById('sidebar-url-btn');

  if (!navigator.clipboard || !navigator.clipboard.readText) {
    showToast(t('browserNotSupported'), 'error');
    return;
  }

  try {
    if (urlBtn) {
      urlBtn.textContent = '⏳';
      urlBtn.disabled = true;
    }

    showToast(t('reading'), 'info', 1500);
    const clipboardContent = await navigator.clipboard.readText();

    if (!clipboardContent || !clipboardContent.trim()) {
      showToast(t('emptyClipboard'), 'error');
      showClipboardScreen('');
      return;
    }

    const trimmedContent = clipboardContent.trim();
    const singleUrlPattern = /^https?:\/\/[^\s]+$/i;

    if (singleUrlPattern.test(trimmedContent)) {
      showToast(t('opening'), 'success', 1500);
      window.open(trimmedContent, '_blank', 'noopener,noreferrer');
      return;
    }

    showClipboardScreen(trimmedContent);

  } catch (error) {
    console.error('Clipboard read error:', error);
    showToast(`❌ ${error.message}`, 'error');
  } finally {
    if (urlBtn) {
      urlBtn.innerHTML = t('url');
      urlBtn.disabled = false;
    }
  }
}

function showClipboardScreen(content) {
  const screen = document.getElementById('clipboard-screen');
  const contentArea = document.getElementById('clipboard-content-area');

  if (!screen || !contentArea) return;

  if (!content || !content.trim()) {
    contentArea.innerHTML = `
      <div class="clipboard-empty">
        <p>${t('clipboardEmpty')}</p>
        <p style="font-size: 14px; color: var(--description-color); margin-top: 10px;">
          ${t('clipboardEmptyDesc')}
        </p>
      </div>
    `;
  } else {
    contentArea.innerHTML = `
      <div class="clipboard-wrapper">
        <div class="clipboard-text">
          <div class="clipboard-pre">${makeUrlsClickable(content)}</div>
        </div>
      </div>
    `;
  }

  showScreen(screen);
}

function makeUrlsClickable(text) {
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi;
  let result = '';
  let lastIndex = 0;
  let match;

  urlPattern.lastIndex = 0;

  while ((match = urlPattern.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index);
    result += escapeHtml(beforeText);

    let url = match[0];
    let trailing = '';
    const trailingMatch = url.match(/([.,;:!?)\]}]+)$/);
    if (trailingMatch) {
      trailing = trailingMatch[1];
      url = url.slice(0, -trailing.length);
    }

    const escapedUrl = escapeHtml(url);
    result += `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="clipboard-inline-link">${escapedUrl}</a>`;

    if (trailing) {
      result += escapeHtml(trailing);
    }

    lastIndex = match.index + match[0].length;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function closeClipboardScreen() {
  showScreen(homeScreen);
}