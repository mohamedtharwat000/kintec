import { StateCreator } from "zustand";
import { PersistOptions } from "zustand/middleware";

// Core auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  provider: string | null;
}

// Auth actions interface
export interface AuthActions {
  setAuthenticated: (status: boolean, email?: string) => void;
  setProvider: (provider: string | null) => void;
  reset: () => void;
}

// Combined auth store type
export type AuthStore = AuthState & AuthActions;

// Persist middleware type
export type AuthPersist = (
  config: StateCreator<AuthStore>,
  options: PersistOptions<AuthStore>
) => StateCreator<AuthStore>;
