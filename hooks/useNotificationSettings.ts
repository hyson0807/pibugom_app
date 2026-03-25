import { useState, useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { registerForPushNotifications } from "@/hooks/usePushNotifications";
import { notificationApi } from "@/services/notificationApi";
import { showToast } from "@/utils/toast";

type OsPermission = "granted" | "denied" | "undetermined";

function toOsPermission(status: Notifications.PermissionStatus): OsPermission {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export function useNotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [osPermission, setOsPermission] = useState<OsPermission>("undetermined");
  const [isLoading, setIsLoading] = useState(true);
  const busyRef = useRef(false);

  const refreshPermissionState = useCallback(async () => {
    try {
      const [{ status }, disabledByUser, pushToken] = await Promise.all([
        Notifications.getPermissionsAsync(),
        SecureStore.getItemAsync("notificationsDisabledByUser"),
        SecureStore.getItemAsync("pushToken"),
      ]);

      setOsPermission(toOsPermission(status));
      setIsEnabled(status === "granted" && !!pushToken && disabledByUser !== "true");
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    refreshPermissionState().finally(() => setIsLoading(false));
  }, [refreshPermissionState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;
      const { status } = await Notifications.getPermissionsAsync();
      const current = toOsPermission(status);
      setOsPermission((prev) => {
        if (prev !== current) refreshPermissionState();
        return current;
      });
    });
    return () => subscription.remove();
  }, [refreshPermissionState]);

  const toggleNotifications = useCallback(async (newValue: boolean) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsLoading(true);
    try {
      if (newValue) {
        const { status } = await Notifications.getPermissionsAsync();

        if (status === "denied") {
          setOsPermission("denied");
          showToast("error", "알림이 차단되어 있어요. 시스템 설정에서 켜주세요.");
          return;
        }

        const token = await registerForPushNotifications();
        if (!token) {
          // 토큰 발급 실패 원인을 구분: 권한 거부 vs 기타 오류
          const { status: recheckStatus } = await Notifications.getPermissionsAsync();
          setOsPermission(toOsPermission(recheckStatus));
          if (recheckStatus !== "granted") {
            showToast("error", "알림이 차단되어 있어요. 시스템 설정에서 켜주세요.");
          } else {
            showToast("error", "푸시 토큰 발급에 실패했어요. 잠시 후 다시 시도해주세요.");
          }
          return;
        }

        setOsPermission("granted");
        setIsEnabled(true);

        await Promise.all([
          SecureStore.setItemAsync("pushToken", token),
          SecureStore.deleteItemAsync("notificationsDisabledByUser"),
        ]);
        try {
          await notificationApi.registerPushToken(token);
        } catch {
          showToast("error", "서버에 알림 등록을 실패했어요. 다시 시도해주세요.");
          setIsEnabled(false);
          await Promise.all([
            SecureStore.deleteItemAsync("pushToken"),
            SecureStore.setItemAsync("notificationsDisabledByUser", "true"),
          ]);
          return;
        }
      } else {
        const pushToken = await SecureStore.getItemAsync("pushToken");
        if (pushToken) {
          try {
            await notificationApi.removePushToken(pushToken);
          } catch {
            showToast("error", "서버에서 알림 해제를 실패했어요. 다시 시도해주세요.");
            return;
          }
        }

        setIsEnabled(false);
        await Promise.all([
          SecureStore.deleteItemAsync("pushToken"),
          SecureStore.setItemAsync("notificationsDisabledByUser", "true"),
        ]);
      }
    } catch {
      setIsEnabled(!newValue);
      showToast("error", "알림 설정 변경에 실패했어요.");
    } finally {
      busyRef.current = false;
      setIsLoading(false);
    }
  }, []);

  return { isEnabled, osPermission, isLoading, toggleNotifications };
}
