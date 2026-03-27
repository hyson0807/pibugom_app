import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Updates: any = null;

if (!__DEV__ && Platform.OS !== "web") {
  try {
    Updates = require("expo-updates");
  } catch {}
}

const UPDATE_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timerId = setTimeout(() => reject(new Error("Update timeout")), ms);
    promise
      .then((result) => { clearTimeout(timerId); resolve(result); })
      .catch((err) => { clearTimeout(timerId); reject(err); });
  });
}

export function useAppUpdates() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!Updates) return;

    let cancelled = false;

    const run = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkResult: any = await withTimeout(Updates.checkForUpdateAsync(), UPDATE_TIMEOUT_MS);

        if (!checkResult.isAvailable) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchResult: any = await withTimeout(Updates.fetchUpdateAsync(), UPDATE_TIMEOUT_MS);

        if (fetchResult.isNew && !cancelled) {
          setUpdateReady(true);
        }
      } catch (e) {
        console.error("[Updates] Error:", e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!updateReady) return;

    Alert.alert(
      "업데이트 완료",
      "새로운 버전이 준비되었어요.\n지금 적용할까요?",
      [
        { text: "나중에", style: "cancel", onPress: () => setUpdateReady(false) },
        { text: "적용", onPress: () => Updates.reloadAsync() },
      ],
    );
  }, [updateReady]);
}
