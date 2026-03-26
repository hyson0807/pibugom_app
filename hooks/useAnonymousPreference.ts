import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "anonymous_preference";

interface AnonymousPreferenceState {
  isAnonymous: boolean;
  toggle: () => void;
}

export const useAnonymousPreference = create<AnonymousPreferenceState>(
  (set) => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) {
        set({ isAnonymous: value === "true" });
      }
    });

    return {
      isAnonymous: true,
      toggle: () =>
        set((state) => {
          const next = !state.isAnonymous;
          AsyncStorage.setItem(STORAGE_KEY, String(next));
          return { isAnonymous: next };
        }),
    };
  },
);
