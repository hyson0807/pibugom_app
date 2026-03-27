import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { notificationApi } from "@/services/notificationApi";
import { Notifications } from "@/services/notifications";

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) return null;

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

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch (e) {
    console.error("[Push] 토큰 발급 실패:", e);
    return null;
  }
}

export function usePushNotifications() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isOnboarded || !Notifications) return;

    let cancelled = false;

    (async () => {
      // Skip if user explicitly disabled notifications in settings
      const disabledByUser = await SecureStore.getItemAsync("notificationsDisabledByUser");
      if (disabledByUser === "true" || cancelled) return;

      const token = await registerForPushNotifications();
      if (cancelled || !token) return;
      tokenRef.current = token;
      SecureStore.setItemAsync("pushToken", token).catch(() => {});

      for (let attempt = 0; attempt < 3; attempt++) {
        if (cancelled) break;
        try {
          await notificationApi.registerPushToken(token);
          break;
        } catch {
          if (cancelled || attempt === 2) break;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isOnboarded]);

  useEffect(() => {
    if (!Notifications) return;

    const subscription =
      Notifications.addNotificationResponseReceivedListener((response: { notification: { request: { content: { data?: { questionId?: string } } } } }) => {
        const questionId =
          response.notification.request.content.data?.questionId;
        if (questionId) {
          router.push(`/question/${questionId}` as never);
        }
      });

    return () => subscription.remove();
  }, [router]);

  return tokenRef;
}
