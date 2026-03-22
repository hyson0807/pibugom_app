import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { notificationApi } from "@/services/notificationApi";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

export function usePushNotifications() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isOnboarded) return;

    let cancelled = false;

    registerForPushNotifications().then((token) => {
      if (cancelled || !token) return;
      tokenRef.current = token;
      SecureStore.setItemAsync("pushToken", token).catch(() => {});
      notificationApi.registerPushToken(token).catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isOnboarded]);

  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const questionId =
          response.notification.request.content.data?.questionId;
        if (questionId) {
          router.push(`/question/${questionId}`);
        }
      });

    return () => subscription.remove();
  }, [router]);

  return tokenRef;
}
