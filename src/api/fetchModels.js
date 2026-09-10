export function fetchModels() {
  const API_URL = '/api/hf-models-api.json';
  
  return new Promise((resolve, reject) => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(textData => {
        try {
          const jsonData = JSON.parse(textData);
          try {
            localStorage.setItem('cached_models', JSON.stringify(jsonData));
          } catch (e) {
            console.warn(e);
          }
          resolve(jsonData);
        } catch (error) {
          reject(new Error(error.message));
        }
      })
      .catch(error => {
        try {
          const cached = localStorage.getItem('cached_models');
          if (cached) {
            resolve(JSON.parse(cached));
          } else {
            reject(error);
          }
        } catch (e) {
          reject(error);
        }
      });
  });
}
