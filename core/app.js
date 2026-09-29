// Конфигурация
const REGISTRY_URL = 'https://e3dr8nj.github.io/NexusAl/registry/registry.json';

// Состояние приложения
let allModules = [];
let installedModules = JSON.parse(localStorage.getItem('installedModules') || '[]');

// DOM элементы
const homeScreen = document.getElementById('home-screen');
const storeScreen = document.getElementById('store-screen');
const appScreen = document.getElementById('app-screen');
const installedAppsContainer = document.getElementById('installed-apps');
const allAppsContainer = document.getElementById('all-apps');
const emptyState = document.getElementById('empty-state');
const currentAppName = document.getElementById('current-app-name');
const appFrame = document.getElementById('app-frame');

// Инициализация
async function init() {
  console.log('Инициализация приложения...');
  await loadRegistry();
  renderInstalledApps();
  setupEventListeners();
  console.log('Приложение готово. Загружено модулей:', allModules.length);
}

// Загрузка реестра модулей
async function loadRegistry() {
  try {
    console.log('Загрузка реестра из:', REGISTRY_URL);
    const response = await fetch