import { Platform } from "react-native";

const stripTrailingSlash = (url: string) =>
  url.endsWith("/") ? url.slice(0, -1) : url;

const getEnv = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value || undefined;
};

export const getApiBaseUrl = (): string => {
  const platformUrl =
    Platform.OS === "android"
      ? getEnv("EXPO_PUBLIC_API_URL_ANDROID")
      : Platform.OS === "ios"
        ? getEnv("EXPO_PUBLIC_API_URL_IOS")
        : getEnv("EXPO_PUBLIC_API_URL_WEB");

  const baseUrl =
    getEnv("EXPO_PUBLIC_API_URL") ??
    platformUrl ??
    (Platform.OS === "android"
      ? "http://10.0.2.2:5004"
      : "http://localhost:5004");

  return stripTrailingSlash(baseUrl);
};
