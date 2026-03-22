import { useState, useEffect, useCallback, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { registerForPushNotifications } from "@/hooks/usePushNotifications";
import { notificationApi } from "@/services/notificationApi";
import { showToast } from "@/utils/toast";

type OsPermission = "granted" | "denied" | "undetermined";

export function useNotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [osPermission, setOsPermission] = useState<OsPermission>("undetermined");
  const [isLoading, setIsLoading] = useState(true);
  const busyRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ status }, disabledByUser, pushToken] = await Promise.all([
          Notifications.getPermissionsAsync(),
          SecureStore.getItemAsync("notificationsDisabledByUser"),
          SecureStore.getItemAsync("pushToken"),
        ]);

        setOsPermission(status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined");
        setIsEnabled(status === "granted" && !!pushToken && disabledByUser !== "true");
      } catch {
        // best-effort
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
          setOsPermission("denied");
          return;
        }

        setOsPermission("granted");
        setIsEnabled(true);

        await Promise.all([
          SecureStore.setItemAsync("pushToken", token),
          SecureStore.deleteItemAsync("notificationsDisabledByUser"),
          notificationApi.registerPushToken(token).catch(() => {}),
        ]);
      } else {
        setIsEnabled(false);

        const pushToken = await SecureStore.getItemAsync("pushToken");
        if (pushToken) {
          await Promise.all([
            notificationApi.removePushToken(pushToken).catch(() => {}),
            SecureStore.deleteItemAsync("pushToken"),
          ]);
        }
        await SecureStore.setItemAsync("notificationsDisabledByUser", "true");
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
