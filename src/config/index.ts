
/**
 * Configuración centralizada para la aplicación
 */

// Intenta obtener la configuración de la API del objeto window.ENV inyectado en tiempo de ejecución
const getApiUrl = () => {
  // Usar una técnica más segura para acceder a window.ENV
  const windowEnv = typeof window !== 'undefined' ? (window.ENV || {}) : {};
  console.log("ENV en tiempo de ejecución:", windowEnv);
  console.log("Variable de entorno VITE_API_URL:", import.meta.env.VITE_API_URL);
  
  // Comprobar si existe API_URL en window.ENV
  if (windowEnv.API_URL) {
    console.log("Usando URL de API desde window.ENV:", windowEnv.API_URL);
    return windowEnv.API_URL;
  }
  
  // Fallback a la variable de entorno de Vite o a la ruta relativa
  const fallbackUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  console.log("Usando URL de API fallback:", fallbackUrl);
  return fallbackUrl;
};

// Configuración del API
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
};

// Otras configuraciones pueden agregarse aquí
export const APP_CONFIG = {
  APP_NAME: "Mi Tienda Online",
  VERSION: "1.0.0",
};
