// Глобальное состояние
let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');
let customModules = JSON.parse(localStorage.getItem('customModules') || '[]');
let currentTab = 'url';
let selectedLocalFile = null;
let selectedFolderFiles = null;
let currentEditingModule = null;
const activeVirtualFS = new Map();

// Хелпер для получения элементов
const $ = (id) => document.getElementById(id);

// DOM элементы
const homeScreen = $('home-screen');
const storeScreen = $('store-screen');
const appScreen = $('app-screen');
const installedAppsContainer = $('installed-apps');
const allAppsContainer = $('all-apps');
const emptyState = $('empty-state');
const currentAppName = $('current-app-name');
const appFrame = $('app-frame');

const addModal = $('add-modal');
const moduleUrlInput = $('module-url-input');
const modalStatus = $('modal-status');
const localFileInput = $('local-file-input');
const selectedFileName = $('selected-file-name');
const folderInput = $('folder-input');
const selectedFolderInfo = $('selected-folder-info');

const createModal = $('create-modal');
const generatedCodeInput = $('generated-code-input');
const createStatus = $('create-status');
const userIdeaInput = $('user-idea-input');
const promptText = $('prompt-text');

const editModal = $('edit-modal');
const editModalTitle = $('edit-modal-title');
const editPreviewIcon = $('edit-preview-icon');
const editPreviewName = $('edit-preview-name');
const editPreviewDesc = $('edit-preview-desc');
const editSourceCode = $('edit-source-code');
const editChangesInput = $('edit-changes-input');
const editNewCodeInput = $('edit-new-code-input');
const editStatus = $('edit-status');

// BASE_PROMPT удален отсюда, так как теперь он находится в prompts.js