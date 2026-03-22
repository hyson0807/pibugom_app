import { useEffect, useState } from "react";
import { Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Updates: any = null;

if (!__DEV__ && Platform.OS !== "web") {
  try {
    Updates = require("expo-updates");
  } catch {}
}

const UPDATE_TIMEOUT_MS = 10_000;

export function useAppUpdates() {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!Updates) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    const run = async () => {
      setIsUpdating(true);

      try {
        const timeout = new Promise<never>((_, reject) => {
          timerId = setTimeout(() => reject(new Error("Update timeout")), UPDATE_TIMEOUT_MS);
        });

        const checkResult = await Promise.race([Updates.checkForUpdateAsync(), timeout]);

        if (checkResult.isAvailable) {
          const fetchResult = await Promise.race([Updates.fetchUpdateAsync(), timeout]);

          if (fetchResult.isNew) {
            await Updates.reloadAsync();
            return;
          }
        }
      } catch (e) {
        console.error("[Updates] Error:", e);
      } finally {
        clearTimeout(timerId);
        if (!cancelled) setIsUpdating(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, []);

  return { isUpdating };
}
