
import { API_CONFIG } from "@/config";

export const API_BASE_URL = API_CONFIG.BASE_URL;

export type ApiError = {
  message: string;
  statusCode: number;
  data?: unknown; // Cambiado de any a unknown para ser más específico
};

export const handleApiError = (error: unknown): ApiError => {
  const defaultError: ApiError = { // Cambiado let por const para evitar reasignación
    message: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
    statusCode: 500,
  };

  if (error && typeof error === 'object') {
    // Si el error tiene la estructura que esperamos de nuestras API
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      defaultError.statusCode = error.statusCode;
    }
    
    if ('message' in error) {
      defaultError.message = String(error.message);
    }
    
    // Preservar datos adicionales del error si existen
    if ('data' in error) {
      defaultError.data = error.data;
    }
  }

  // Si es un error de red (como cuando el servidor está caído)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    defaultError.message = 'Error de conexión. Por favor, verifica tu conexión a internet o inténtalo más tarde.';
    defaultError.statusCode = 0; // Código personalizado para errores de red
  }

  return defaultError;
};

type ApiHeaders = {
  "Content-Type": string;
  Authorization?: string;
};

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> => {
  const token = localStorage.getItem("token");
  
  const headers: ApiHeaders = {
    "Content-Type": "application/json",
  };

  if (requiresAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      try {
        data = JSON.parse(data);
      } catch (e) {
        // Si no es JSON, mantenemos el texto como está
      }
    }

    if (!response.ok) {
      throw {
        message: data.message || "Error en la solicitud",
        statusCode: response.status,
        data
      };
    }

    return data as T;
  } catch (error) {
    // Capturar el error, transformarlo y relanzarlo
    const processedError = handleApiError(error);
    console.error("API Error:", processedError);
    throw processedError;
  }
};
