import axios from 'axios';

// 1. Lee la URL base desde las variables de entorno de Vite.
const baseURL = import.meta.env.VITE_API_BASE_URL;

// 2. DIAGNÓSTICO: Esto nos mostrará en la consola del navegador qué URL está usando.
console.log("VITE_API_BASE_URL is:", baseURL);

// 3. Si la variable no está definida, lanza un error claro.
if (!baseURL) {
  console.error("CRITICAL ERROR: La variable de entorno VITE_API_BASE_URL no está configurada en el entorno de Vercel.");
}

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
