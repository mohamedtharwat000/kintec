import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalStoreData(key: string) {
  if (typeof window !== "undefined") {
    const localAuthStore = localStorage.getItem("auth-storage");
    if (localAuthStore) {
      const value = JSON.parse(localAuthStore).state[key];
      if (value) return value;
    }
    return null;
  }
}
