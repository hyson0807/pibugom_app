import { Platform } from "react-native";

const DEFAULT_URL =
  Platform.OS === "android" ? "http://10.0.2.2:5004" : "http://localhost:5004";

export const getApiBaseUrl = (): string => {
  const url = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
};
