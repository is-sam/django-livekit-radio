import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns an object with Authorization header if token is present in localStorage
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : { };
}