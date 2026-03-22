import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "recent_searches";
const MAX_ITEMS = 20;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        setSearches(JSON.parse(raw));
      } catch {
        AsyncStorage.removeItem(STORAGE_KEY);
      }
    });
  }, []);

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((term: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearches([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { searches, addSearch, removeSearch, clearAll };
}
