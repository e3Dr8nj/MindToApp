// Загрузка реестра модулей
async function loadRegistry() {
  try {
    const response = await fetch(REGISTRY_URL);
    const data = await response.json();
    
    // Для каждого модуля загружаем HTML и парсим manifest
    allModules = await Promise.all(
      data.modules.map(async (module) => {
        try {
          const htmlResponse = await fetch(module.url);
          const htmlText = await htmlResponse.text();
          
          // Парсим manifest из HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          const manifestScript = doc.getElementById('manifest');
          
          if (manifestScript) {
            const manifest = JSON.parse(manifestScript.textContent);
            return {
              ...manifest,
              url: module.url
            };
          }
        } catch (error) {
          console.error('Ошибка загрузки модуля:', module.url, error);
        }
        return null;
      })
    );
    
    // Фильтруем модули, которые не загрузились
    allModules = allModules.filter(m => m !== null);
    
  } catch (error) {
    console.error('Ошибка загрузки реестра:', error);
    allModules = [];
  }
}