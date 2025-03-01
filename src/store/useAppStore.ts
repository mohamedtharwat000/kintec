import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AppStoreState {
  username: string | null;
  isAuthenticated: boolean;
}

export interface AppStoreActions {
  setUsername: (username: string) => void;
  setAuthenticated: (status: boolean, username?: string) => void;
  reset: () => void;
}

export type AppAuthStore = AppStoreState & AppStoreActions;

const initialState: AppStoreState = {
  username: null,
  isAuthenticated: false,
};

export const useAppStore = create<AppAuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUsername: (username: string): void => set({ username }),

      setAuthenticated: (status, username): void =>
        set({
          isAuthenticated: status,
          username: username || null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "app-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
