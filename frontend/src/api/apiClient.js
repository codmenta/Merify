import axios from 'axios';

// Lee la URL base desde las variables de entorno de Vite
// El prefijo VITE_ es obligatorio para que Vercel/Vite la exponga al frontend.
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Si la variable no está definida, lanza un error claro para saber qué pasa.
if (!baseURL) {
  console.error("ERROR: La variable de entorno VITE_API_BASE_URL no está configurada.");
}

const apiClient = axios.create({
  baseURL: baseURL, // Usa la URL de Render en producción
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
