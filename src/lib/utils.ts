
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an order ID safely by converting it to a string if necessary
 * and taking the first 8 characters in uppercase
 */
export function formatOrderId(orderId: string | number) {
  if (typeof orderId === 'string') {
    return orderId.substring(0, 8).toUpperCase();
  } else if (typeof orderId === 'number') {
    return String(orderId).substring(0, 8).toUpperCase();
  }
  return 'ID-UNKNOWN';
}
