import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "@/services/network";

export interface User {
  id: string;
  email: string;
  nickname: string | null;
  profileImage: string | null;
  isOnboarded: boolean;
  gender: string | null;
  createdAt: string;
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
  fetchProfile: () => Promise<void>;
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

      if (accessToken) {
        const { api } = await import("../services/api");
        try {
          const { data } = await api.get<User>("/users/me");
          set({ user: data });
        } catch {
          // profile fetch is best-effort
        }
      }
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

  fetchProfile: async () => {
    try {
      const { api } = await import("../services/api");
      const { data } = await api.get<User>("/users/me");
      set({ user: data });
    } catch {
      // profile fetch is best-effort
    }
  },

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    set({ accessToken, refreshToken });
  },

  logout: async () => {
    const token = useAuthStore.getState().accessToken;
    // Remove push token from server BEFORE revoking auth token
    try {
      const pushToken = await SecureStore.getItemAsync("pushToken");
      if (pushToken) {
        const { notificationApi } = await import("../services/notificationApi");
        await notificationApi.removePushToken(pushToken);
        await SecureStore.deleteItemAsync("pushToken");
      }
    } catch {
      // best-effort
    }
    // Use plain axios to avoid response interceptor loop
    try {
      const { default: axios } = await import("axios");
      const baseURL = getApiBaseUrl();
      await axios.post(`${baseURL}/auth/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5_000,
      });
    } catch {
      // best-effort: clear local state even if server call fails
    }
    await Promise.all([
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
      SecureStore.deleteItemAsync("isOnboarded"),
      SecureStore.deleteItemAsync("notificationsDisabledByUser"),
    ]);
    set({
      accessToken: null,
      refreshToken: null,
      isOnboarded: false,
      user: null,
      isAuthenticated: false,
    });
  },
}));
