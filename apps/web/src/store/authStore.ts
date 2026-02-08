import { create } from "zustand";

type User = {
  id: string;
  email: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
  isBootstrapped: boolean;
  markBootstrapped: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapped: false,

  markBootstrapped: () => set({ isBootstrapped: true }),

  login: ({ user, accessToken }) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
