import axios from 'axios';

// Definimos una URL base con un fallback en caso de que la variable de entorno no esté disponible
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
console.log('API Base URL:', API_BASE_URL); // Verificamos la URL base que se está usando

// Función para suprimir errores de red específicos en consola
const silentErrorHandler = (error: any) => {
  // Lista de errores de red que queremos silenciar
  const networkErrors = ['ETIMEDOUT', 'ECONNABORTED', 'Network Error'];
  
  // Verificar si es un error de red que debemos silenciar
  if ((error.code && networkErrors.includes(error.code)) || 
      (error.message && networkErrors.some(e => error.message.includes(e)))) {
    // Silenciar el error de red (mostrar advertencia en lugar de error)
    console.warn('Conexión a la API no disponible');
    return Promise.reject(error);
  }
  
  // Para otros errores, dejar que se procesen normalmente
  return Promise.reject(error);
};

// Obtener headers de autenticación desde localStorage
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Configurando el cliente axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Agregar el interceptor de solicitud para actualizar los headers de autenticación
api.interceptors.request.use((config) => {
  config.headers = getAuthHeaders();
  return config;
});

// Agregar el interceptor para manejar errores
api.interceptors.response.use(
  response => response, // Pasar la respuesta sin modificar
  silentErrorHandler // Usar nuestro manejador de errores
);
