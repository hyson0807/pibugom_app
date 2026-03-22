import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface User {
  id: string;
  email: string;
  nickname: string | null;
  profileImage: string | null;
  isOnboarded: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isOnboarded: boolean;
  user: User | null;
  isInitialized: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (
    accessToken: string,
    refreshToken: string,
    isOnboarded: boolean
  ) => Promise<void>;
  setOnboarded: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isOnboarded: false,
  user: null,
  isInitialized: false,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const isOnboarded =
        (await SecureStore.getItemAsync("isOnboarded")) === "true";

      set({
        accessToken,
        refreshToken,
        isOnboarded,
        isAuthenticated: !!accessToken,
        isInitialized: true,
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (accessToken, refreshToken, isOnboarded) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    await SecureStore.setItemAsync("isOnboarded", String(isOnboarded));
    set({
      accessToken,
      refreshToken,
      isOnboarded,
      isAuthenticated: true,
    });
  },

  setOnboarded: async () => {
    await SecureStore.setItemAsync("isOnboarded", "true");
    set({ isOnboarded: true });
  },

  setUser: (user) => set({ user }),

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    set({ accessToken, refreshToken });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("isOnboarded");
    set({
      accessToken: null,
      refreshToken: null,
      isOnboarded: false,
      user: null,
      isAuthenticated: false,
    });
  },
}));
