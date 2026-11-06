// ==========================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

function setupEventListeners() {
  const languageToggleBtn = document.getElementById('language-toggle-btn');
  if (languageToggleBtn) {
    languageToggleBtn.addEventListener('click', function() {
      if (typeof toggleLanguage === 'function') toggleLanguage();
    });
  }

  const burgerBtn = document.getElementById('burger-menu-btn');
  const headerMenu = document.getElementById('header-menu');

  if (burgerBtn && headerMenu) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      headerMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!headerMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
        headerMenu.classList.remove('active');
      }
    });

    headerMenu.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => {
        headerMenu.classList.remove('active');
      });
    });
  }

  const openStoreBtn = document.getElementById('open-store-btn');
  const backToHomeBtn = document.getElementById('back-to-home-btn');
  const goToStoreBtn = document.getElementById('go-to-store-btn');
  const closeAppBtn = document.getElementById('close-app-btn');

  if (openStoreBtn) openStoreBtn.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  if (backToHomeBtn) backToHomeBtn.addEventListener('click', () => showScreen(homeScreen));
  if (goToStoreBtn) goToStoreBtn.addEventListener('click', () => { renderAllApps(); showScreen(storeScreen); });
  if (closeAppBtn) closeAppBtn.addEventListener('click', closeApp);

  const builderBtn = document.getElementById('builder-btn');
  const builderCloseBtn = document.getElementById('builder-close-btn');
  const builderCopyPromptBtn = document.getElementById('builder-copy-prompt-btn');
  const builderOpenAiBtn = document.getElementById('builder-open-ai-btn');
  const builderCreateBtn = document.getElementById('builder-create-btn');

  if (builderBtn) builderBtn.addEventListener('click', openBuilder);
  if (builderCloseBtn) builderCloseBtn.addEventListener('click', closeBuilder);
  if (builderCopyPromptBtn) builderCopyPromptBtn.addEventListener('click', copyBuilderPrompt);
  if (builderOpenAiBtn) builderOpenAiBtn.addEventListener('click', openSelectedAI);
  if (builderCreateBtn) builderCreateBtn.addEventListener('click', createFromBuilder);

  const toggleCodeBtn = document.getElementById('toggle-code-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const copyEditPromptBtn = document.getElementById('copy-edit-prompt-btn');
  const closeEditBtn = document.getElementById('close-edit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editModal = document.getElementById('edit-modal');

  if (toggleCodeBtn) toggleCodeBtn.addEventListener('click', () => { if (typeof toggleCodeVisibility === 'function') toggleCodeVisibility(); });
  if (copyCodeBtn) copyCodeBtn.addEventListener('click', () => { if (typeof copyCodeFromEditModal === 'function') copyCodeFromEditModal(); });
  if (copyEditPromptBtn) copyEditPromptBtn.addEventListener('click', () => { if (typeof copyEditPrompt === 'function') copyEditPrompt(); });
  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
  if (editModal) editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

  const createAppBtn = document.getElementById('create-app-btn');
  const closeCreateBtn = document.getElementById('close-create-btn');
  const cancelCreateBtn = document.getElementById('cancel-create-btn');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const confirmCreateBtn = document.getElementById('confirm-create-btn');
  const createModal = document.getElementById('create-modal');
  const userIdeaInput = document.getElementById('user-idea-input');

  if (createAppBtn) createAppBtn.addEventListener('click', () => { if (typeof openCreateModal === 'function') openCreateModal(); });
  if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeCreateModal);
  if (cancelCreateBtn) cancelCreateBtn.addEventListener('click', closeCreateModal);
  if (copyPromptBtn) copyPromptBtn.addEventListener('click', () => {
    const idea = userIdeaInput ? userIdeaInput.value.trim() : '';
    const fullPrompt = idea ? `${getPrompt()}\n\n${idea}` : getPrompt();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullPrompt).then(() => showToast(t('promptCopied'), 'success')).catch(() => showToast(t('copyFailed'), 'error'));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = fullPrompt;
      textarea.style.position = 'fixed'; textarea.style.opacity = '0';
      document.body.appendChild(textarea); textarea.select();
      try { document.execCommand('copy'); showToast(t('promptCopied'), 'success'); } catch (e) { showToast(t('copyFailed'), 'error'); }
      document.body.removeChild(textarea);
    }
  });
  if (confirmCreateBtn) confirmCreateBtn.addEventListener('click', () => { if (typeof createAppFromText === 'function') createAppFromText(); });
  if (createModal) createModal.addEventListener('click', (e) => { if (e.target === createModal) closeCreateModal(); });
  if (userIdeaInput) userIdeaInput.addEventListener('input', updatePromptPreview);

  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', refreshApp);

  const addCustomBtn = document.getElementById('add-custom-btn');
  const addCustomBtnStore = document.getElementById('add-custom-btn-store');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const confirmAddBtn = document.getElementById('confirm-add-btn');
  const addModal = document.getElementById('add-modal');
  const moduleUrlInput = document.getElementById('module-url-input');
  const selectFileBtn = document.getElementById('select-file-btn');
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const localFileInput = document.getElementById('local-file-input');
  const folderInput = document.getElementById('folder-input');

  if (addCustomBtn) addCustomBtn.addEventListener('click', () => { if (typeof openAddModal === 'function') openAddModal(); });
  if (addCustomBtnStore) addCustomBtnStore.addEventListener('click', () => { if (typeof openAddModal === 'function') openAddModal(); });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeAddModal);
  if (confirmAddBtn) confirmAddBtn.addEventListener('click', () => { if (typeof addModule === 'function') addModule(); });
  if (addModal) addModal.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
  if (moduleUrlInput) moduleUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && typeof addModule === 'function') addModule(); });
  if (selectFileBtn) selectFileBtn.addEventListener('click', () => { if (localFileInput) localFileInput.click(); });
  if (selectFolderBtn) selectFolderBtn.addEventListener('click', () => { if (folderInput) folderInput.click(); });

  // ШАРИНГ И ПРИВЯЗКА ССЫЛОК
  const closeShareBtn = document.getElementById('close-share-btn');
  const closeShareFooterBtn = document.getElementById('close-share-footer-btn');
  const shareFileBtn = document.getElementById('share-file-btn');
  const copyAppCodeBtn = document.getElementById('copy-app-code-btn');
  const shareModal = document.getElementById('share-modal');
  const bindUrlBtn = document.getElementById('bind-url-btn');
  const unbindUrlBtn = document.getElementById('unbind-url-btn');
  const shareTelegramBtn = document.getElementById('share-telegram-btn');

  if (closeShareBtn) closeShareBtn.addEventListener('click', closeShareModal);
  if (closeShareFooterBtn) closeShareFooterBtn.addEventListener('click', closeShareModal);
  if (shareFileBtn) shareFileBtn.addEventListener('click', shareHtmlFile);
  if (copyAppCodeBtn) copyAppCodeBtn.addEventListener('click', copyAppCode);
  if (shareModal) shareModal.addEventListener('click', (e) => { if (e.target === shareModal) closeShareModal(); });
  if (bindUrlBtn) bindUrlBtn.addEventListener('click', bindUrlToApp);
  if (unbindUrlBtn) unbindUrlBtn.addEventListener('click', unbindUrlFromApp);
  if (shareTelegramBtn) shareTelegramBtn.addEventListener('click', shareToTelegram);

  // ==========================================
  // ЭКСПОРТ / ИМПОРТ (ОБНОВЛЕНО)
  // ==========================================
  const sidebarExportBtn = document.getElementById('sidebar-export-btn');
  const exportModal = document.getElementById('export-modal');
  const closeExportBtn = document.getElementById('close-export-btn');
  const closeExportFooterBtn = document.getElementById('close-export-footer-btn');
  const exportSelectBtn = document.getElementById('export-select-folder-btn');
  const exportClearBtn = document.getElementById('export-clear-btn');
  const exportRunBtn = document.getElementById('export-run-btn');

  if (sidebarExportBtn) sidebarExportBtn.addEventListener('click', () => { if (typeof openExportModal === 'function') openExportModal(); });
  if (closeExportBtn) closeExportBtn.addEventListener('click', closeExportModal);
  if (closeExportFooterBtn) closeExportFooterBtn.addEventListener('click', closeExportModal);
  if (exportSelectBtn) exportSelectBtn.addEventListener('click', () => { if (typeof selectExportFolder === 'function') selectExportFolder(); });
  if (exportClearBtn) exportClearBtn.addEventListener('click', () => { if (typeof clearExportFolder === 'function') clearExportFolder(); });
  if (exportRunBtn) exportRunBtn.addEventListener('click', () => { if (typeof runExport === 'function') runExport(); });
  if (exportModal) exportModal.addEventListener('click', (e) => { if (e.target === exportModal) closeExportModal(); });

  const sidebarImportBtn = document.getElementById('sidebar-import-btn');
  const importModal = document.getElementById('import-modal');
  const closeImportBtn = document.getElementById('close-import-btn');
  const closeImportFooterBtn = document.getElementById('close-import-footer-btn');
  const importSelectBtn = document.getElementById('import-select-folder-btn');
  const importClearBtn = document.getElementById('import-clear-btn');
  const importRunBtn = document.getElementById('import-run-btn');
  const importFolderInput = document.getElementById('import-folder-input');

  if (sidebarImportBtn) sidebarImportBtn.addEventListener('click', () => { if (typeof openImportModal === 'function') openImportModal(); });
  if (closeImportBtn) closeImportBtn.addEventListener('click', closeImportModal);
  if (closeImportFooterBtn) closeImportFooterBtn.addEventListener('click', closeImportModal);
  if (importSelectBtn) importSelectBtn.addEventListener('click', () => { if (typeof selectImportFolder === 'function') selectImportFolder(); });
  if (importClearBtn) importClearBtn.addEventListener('click', () => { if (typeof clearImportFolder === 'function') clearImportFolder(); });
  if (importRunBtn) importRunBtn.addEventListener('click', () => { if (typeof runImport === 'function') runImport(); });
  if (importFolderInput) importFolderInput.addEventListener('change', (e) => { if (typeof handleFallbackFolderSelect === 'function') handleFallbackFolderSelect(e); });
  if (importModal) importModal.addEventListener('click', (e) => { if (e.target === importModal) closeImportModal(); });
  // ==========================================

  const exportUrlsBtn = document.getElementById('export-urls-btn');
  const closeExportUrlsBtn = document.getElementById('close-export-urls-btn');
  const closeExportUrlsFooterBtn = document.getElementById('close-export-urls-footer-btn');
  const copyExportUrlsBtn = document.getElementById('copy-export-urls-btn');
  const exportUrlsModal = document.getElementById('export-urls-modal');

  if (exportUrlsBtn) exportUrlsBtn.addEventListener('click', openExportUrlsModal);
  if (closeExportUrlsBtn) closeExportUrlsBtn.addEventListener('click', closeExportUrlsModal);
  if (closeExportUrlsFooterBtn) closeExportUrlsFooterBtn.addEventListener('click', closeExportUrlsModal);
  if (copyExportUrlsBtn) copyExportUrlsBtn.addEventListener('click', copyExportText);
  if (exportUrlsModal) exportUrlsModal.addEventListener('click', (e) => { if (e.target === exportUrlsModal) closeExportUrlsModal(); });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => { if (typeof switchTab === 'function') switchTab(btn.dataset.target); });
  });

  const sidebarPromptBtn = document.getElementById('sidebar-prompt-btn');
  if (sidebarPromptBtn) {
    sidebarPromptBtn.addEventListener('click', () => {
      const promptTextValue = getPrompt();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(promptTextValue).then(() => {
          const btn = document.getElementById('sidebar-prompt-btn');
          if (btn) { const orig = btn.innerHTML; btn.innerHTML = '✅'; setTimeout(() => { btn.innerHTML = orig; }, 2000); }
          showToast(t('promptCopied'), 'success');
        }).catch(() => showToast(t('copyFailed'), 'error'));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = promptTextValue; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea); textarea.select();
        try {
          document.execCommand('copy');
          const btn = document.getElementById('sidebar-prompt-btn');
          if (btn) { const orig = btn.innerHTML; btn.innerHTML = '✅'; setTimeout(() => { btn.innerHTML = orig; }, 2000); }
          showToast(t('promptCopied'), 'success');
        } catch (e) { showToast(t('copyFailed'), 'error'); }
        document.body.removeChild(textarea);
      }
    });
  }

  const sidebarCreateBtn = document.getElementById('sidebar-create-btn');
  if (sidebarCreateBtn) sidebarCreateBtn.addEventListener('click', createFromClipboard);

  const sidebarUrlBtn = document.getElementById('sidebar-url-btn');
  if (sidebarUrlBtn) sidebarUrlBtn.addEventListener('click', handleUrlFromClipboard);

  const closeClipboardScreenBtn = document.getElementById('close-clipboard-screen-btn');
  if (closeClipboardScreenBtn) closeClipboardScreenBtn.addEventListener('click', closeClipboardScreen);

  const aiPanelCloseBtn = document.getElementById('ai-panel-close-btn');
  if (aiPanelCloseBtn) aiPanelCloseBtn.addEventListener('click', closeAIPanel);

  const manageThemesBtn = document.getElementById('manage-themes-btn');
  const closeThemesBtn = document.getElementById('close-themes-btn');
  const closeThemesFooterBtn = document.getElementById('close-themes-footer-btn');
  const themesModal = document.getElementById('themes-modal');

  if (manageThemesBtn) manageThemesBtn.addEventListener('click', () => {
    const modal = document.getElementById('themes-modal');
    if (modal) { modal.classList.add('active'); if (typeof renderCustomThemesList === 'function') renderCustomThemesList(); }
  });
  if (closeThemesBtn) closeThemesBtn.addEventListener('click', () => { const modal = document.getElementById('themes-modal'); if (modal) modal.classList.remove('active'); });
  if (closeThemesFooterBtn) closeThemesFooterBtn.addEventListener('click', () => { const modal = document.getElementById('themes-modal'); if (modal) modal.classList.remove('active'); });
  if (themesModal) themesModal.addEventListener('click', (e) => { if (e.target === themesModal) themesModal.classList.remove('active'); });

  const addThemeBtn = document.getElementById('add-theme-btn');
  const closeAddThemeBtn = document.getElementById('close-add-theme-btn');
  const cancelAddThemeBtn = document.getElementById('cancel-add-theme-btn');
  const copyThemeTemplateBtn = document.getElementById('copy-theme-template-btn');
  const submitThemeBtn = document.getElementById('submit-theme-btn');
  const addThemeModal = document.getElementById('add-theme-modal');

  if (addThemeBtn) addThemeBtn.addEventListener('click', () => { if (typeof openAddThemeModal === 'function') openAddThemeModal(); });
  if (closeAddThemeBtn) closeAddThemeBtn.addEventListener('click', closeAddThemeModal);
  if (cancelAddThemeBtn) cancelAddThemeBtn.addEventListener('click', closeAddThemeModal);
  if (copyThemeTemplateBtn) copyThemeTemplateBtn.addEventListener('click', () => { if (typeof copyThemeTemplate === 'function') copyThemeTemplate(); });
  if (submitThemeBtn) submitThemeBtn.addEventListener('click', () => { if (typeof submitCustomTheme === 'function') submitCustomTheme(); });
  if (addThemeModal) addThemeModal.addEventListener('click', (e) => { if (e.target === addThemeModal) closeAddThemeModal(); });

  const editPromptsBtn = document.getElementById('edit-prompts-btn');
  const closePromptsBtn = document.getElementById('close-prompts-btn');
  const savePromptBtn = document.getElementById('save-prompt-btn');
  const resetPromptBtn = document.getElementById('reset-prompt-btn');
  const promptsModal = document.getElementById('prompts-modal');

  if (editPromptsBtn) editPromptsBtn.addEventListener('click', openPromptsModal);
  if (closePromptsBtn) closePromptsBtn.addEventListener('click', closePromptsModal);
  if (savePromptBtn) savePromptBtn.addEventListener('click', savePrompt);
  if (resetPromptBtn) resetPromptBtn.addEventListener('click', resetPromptToDefault);
  if (promptsModal) promptsModal.addEventListener('click', (e) => { if (e.target === promptsModal) closePromptsModal(); });

  const manageAiBtn = document.getElementById('manage-ai-btn');
  const closeAiManagerBtn = document.getElementById('close-ai-manager-btn');
  const closeAiManagerFooterBtn = document.getElementById('close-ai-manager-footer-btn');
  const aiManagerModal = document.getElementById('ai-manager-modal');
  const addAiBtn = document.getElementById('add-ai-btn');
  const saveAiBtn = document.getElementById('save-ai-btn');
  const cancelAiEditBtn = document.getElementById('cancel-ai-edit-btn');
  const resetAiListBtn = document.getElementById('reset-ai-list-btn');

  if (manageAiBtn) manageAiBtn.addEventListener('click', openAIManagerModal);
  if (closeAiManagerBtn) closeAiManagerBtn.addEventListener('click', closeAIManagerModal);
  if (closeAiManagerFooterBtn) closeAiManagerFooterBtn.addEventListener('click', closeAIManagerModal);
  if (aiManagerModal) aiManagerModal.addEventListener('click', (e) => { if (e.target === aiManagerModal) closeAIManagerModal(); });
  if (addAiBtn) addAiBtn.addEventListener('click', () => showAIEditor(null));
  if (saveAiBtn) saveAiBtn.addEventListener('click', saveAINetworkFromForm);
  if (cancelAiEditBtn) cancelAiEditBtn.addEventListener('click', hideAIEditor);
  if (resetAiListBtn) resetAiListBtn.addEventListener('click', resetAIList);

  const closeAppInfoBtn = document.getElementById('close-app-info-btn');
  const closeAppInfoFooterBtn = document.getElementById('close-app-info-footer-btn');
  const appInfoModal = document.getElementById('app-info-modal');

  if (closeAppInfoBtn) closeAppInfoBtn.addEventListener('click', closeAppInfoModal);
  if (closeAppInfoFooterBtn) closeAppInfoFooterBtn.addEventListener('click', closeAppInfoModal);
  if (appInfoModal) appInfoModal.addEventListener('click', (e) => { if (e.target === appInfoModal) closeAppInfoModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCreateModal(); closeAddModal(); closeShareModal(); closeBuilder(); closeAIPanel();
      closeAddThemeModal(); closePromptsModal(); closeAIManagerModal(); closeAppInfoModal();
      closeClipboardScreen(); closeExportUrlsModal(); closeExportModal(); closeImportModal(); hideCardContextMenu();
      const tModal = document.getElementById('themes-modal'); if (tModal) tModal.classList.remove('active');
      if (headerMenu) headerMenu.classList.remove('active');
    }
  });
}

function showAIEditor(network) {
  const editorBox = document.getElementById('ai-editor-box');
  const title = document.getElementById('ai-editor-title');
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');
  if (!editorBox || !title || !idInput || !nameInput || !urlInput) return;
  editorBox.style.display = 'block';
  if (network) {
    title.textContent = t('editAI');
    idInput.value = network.id; nameInput.value = network.name; urlInput.value = network.url;
  } else {
    title.textContent = t('newAI');
    idInput.value = ''; nameInput.value = ''; urlInput.value = '';
  }
}

function saveAINetworkFromForm() {
  const idInput = document.getElementById('ai-edit-id');
  const nameInput = document.getElementById('ai-edit-name');
  const urlInput = document.getElementById('ai-edit-url');
  const status = document.getElementById('ai-editor-status');
  if (!idInput || !nameInput || !urlInput) return;
  const id = idInput.value.trim(); const name = nameInput.value.trim(); const url = urlInput.value.trim();
  if (!id || !name || !url) { if (status) { status.textContent = t('fillAllFields'); status.className = 'modal-status error'; } return; }
  if (!/^https?:\/\//i.test(url)) { if (status) { status.textContent = t('urlMustStart'); status.className = 'modal-status error'; } return; }
  const networks = getAINetworks();
  const existingIndex = networks.findIndex(n => n.id === id);
  const newNetwork = { id, name, url };
  if (existingIndex > -1) networks[existingIndex] = newNetwork; else networks.push(newNetwork);
  saveAINetworks(networks);
  if (status) { status.textContent = t('aiSaved'); status.className = 'modal-status success'; }
  setTimeout(() => {
    hideAIEditor();
    if (typeof renderAINetworksList === 'function') renderAINetworksList();
    if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
  }, 800);
}

function resetAIList() {
  if (!confirm(t('resetListConfirm'))) return;
  resetAINetworks();
  renderAINetworksList();
  if (typeof initAINetworksInUI === 'function') initAINetworksInUI();
}

// ==========================================
// ЗАПУСК ПЛАТФОРМЫ
// ==========================================
init();