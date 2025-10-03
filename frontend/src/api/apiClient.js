import axios from 'axios';

// 1. Lee la URL base desde las variables de entorno de Vite.
// El prefijo VITE_ es obligatorio para que Vercel/Vite la exponga al frontend.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 2. DIAGNÓSTICO: Esto nos mostrará en la consola del navegador qué URL está usando.
// Esto es CLAVE para depurar.
console.log(`[API Client] La URL base de la API es: ${baseURL}`);

const apiClient = axios.create({
  baseURL: baseURL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
