import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Updates: any = null;

if (!__DEV__ && Platform.OS !== "web") {
  try {
    Updates = require("expo-updates");
  } catch {
    // expo-updates not available
  }
}

export function useAppUpdates() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAndApplyUpdate = useCallback(async () => {
    if (!Updates) return;

    try {
      setIsUpdating(true);

      const checkResult = await Updates.checkForUpdateAsync();

      if (checkResult.isAvailable) {
        const fetchResult = await Updates.fetchUpdateAsync();

        if (fetchResult.isNew) {
          await Updates.reloadAsync();
        }
      }

      setIsUpdating(false);
    } catch (e) {
      console.error("[Updates] Error:", e);
      setIsUpdating(false);
      setError(e as Error);
    }
  }, []);

  useEffect(() => {
    checkAndApplyUpdate();
  }, [checkAndApplyUpdate]);

  return { isUpdating, error, checkAndApplyUpdate };
}
