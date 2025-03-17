
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Helper function to safely format dates
export const formatDate = (dateString?: string) => {
  if (!dateString) {
    return "Fecha no disponible";
  }
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Fecha no disponible";
    }
    return format(date, "PPP", { locale: es });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha no disponible";
  }
};

// Helper function to safely format dates with a specific format
export const formatDateWithPattern = (dateString?: string, pattern: string = "dd/MM/yyyy") => {
  if (!dateString) {
    return "Fecha no disponible";
  }
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Fecha no disponible";
    }
    return format(date, pattern, { locale: es });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha no disponible";
  }
};
