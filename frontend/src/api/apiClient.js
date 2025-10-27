import axios from 'axios';

// Esto está perfecto, no hay que cambiarlo
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log(`[API Client] La URL base de la API es: ${baseURL}`);

const apiClient = axios.create({
  baseURL: baseURL,
});

// Interceptores para logging
apiClient.interceptors.request.use(
  (config) => {
    console.group(`🌐 Petición API: ${config.method.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    console.log('Datos enviados:', config.data);
    console.groupEnd();

    // Obtenemos el token de localStorage
    const token = localStorage.getItem('token'); 
    
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken) {
          config.headers.Authorization = `Bearer ${parsedToken}`;
          console.log('🔑 Token añadido a la petición');
        }
      } catch (e) {
        console.error("❌ Error al parsear el token:", e);
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
apiClient.interceptors.response.use(
  (response) => {
    console.group(`✅ Respuesta de ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Datos recibidos:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group(`❌ Error en ${error.config?.url || 'petición'}`);
    console.log('Status:', error.response?.status);
    console.log('Mensaje:', error.response?.data?.detail || error.message);
    console.log('Datos completos del error:', error.response?.data);
    console.groupEnd();
    return Promise.reject(error);
  }
);

export default apiClient;