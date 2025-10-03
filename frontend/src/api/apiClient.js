import axios from 'axios';

// Esto está perfecto, no hay que cambiarlo
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log(`[API Client] La URL base de la API es: ${baseURL}`);

const apiClient = axios.create({
  baseURL: baseURL,
});

// Interceptor con la corrección
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token de localStorage (que está "envuelto" en comillas)
    const token = localStorage.getItem('token'); 
    
    if (token) {
      // --- CAMBIO CLAVE AQUÍ ---
      // Usamos JSON.parse() para quitar las comillas extra del string
      // antes de inyectarlo en la cabecera.
      // Si el token es null o inválido, JSON.parse dará error, así que
      // lo manejamos dentro de un bloque try...catch por seguridad.
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken) {
          config.headers.Authorization = `Bearer ${parsedToken}`;
        }
      } catch (e) {
        console.error("No se pudo parsear el token desde localStorage", e);
        // Opcional: limpiar token corrupto
        // localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;