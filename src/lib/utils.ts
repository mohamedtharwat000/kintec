import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tryCatch<T>(fn: () => T | Promise<T>):
  | {
      data?: T;
      error?: Error;
    }
  | Promise<{
      data?: T;
      error?: Error;
    }> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.then((data) => ({ data })).catch((error) => ({ error }));
    }

    return { data: result };
  } catch (err) {
    return { error: err as Error };
  }
}
