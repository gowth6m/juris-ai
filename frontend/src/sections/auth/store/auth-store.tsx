import { create } from 'zustand';
import AppConfig from '@/configs/app-config';
import { User } from '@/services/types/auth';
import { persist, createJSONStorage } from 'zustand/middleware';

// -------------------------------------------------

type AuthState = {
  token: string | null;
  setToken: (value: string | null) => void;

  user: User | null;
  setUser: (value: User | null) => void;

  isLoading: boolean;
  setLoading: (value: boolean) => void;

  reset: () => void;
};

// -------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (value) => set({ token: value }),

      user: null,
      setUser: (value) => set({ user: value }),

      isLoading: false,
      setLoading: (value) => set({ isLoading: value }),

      reset: () => set({ token: null, user: null }),
    }),
    {
      name: AppConfig.localStorageKeys.auth,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
