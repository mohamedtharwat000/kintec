import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, AuthStore, AuthPersist } from "@/types/store";

const initialState: AuthState = {
  isAuthenticated: false,
  userEmail: null,
  provider: null,
};

const persistFn = persist as AuthPersist;

export const useAuthStore = create<AuthStore>()(
  persistFn(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,
      provider: null,

      setAuthenticated: (status, email): void =>
        set({
          isAuthenticated: status,
          userEmail: email || null,
        }),

      setProvider: (provider): void => set({ provider }),

      reset: () => set(initialState),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
