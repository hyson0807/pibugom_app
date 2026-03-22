import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTION_COUNT_KEY = '@pibugom/action_count';
const TRIGGER_COUNTS = [3, 10, 30, 60, 100];

export const tryRequestReview = async (): Promise<void> => {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    const currentCountStr = await AsyncStorage.getItem(ACTION_COUNT_KEY);
    let count = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    count += 1;
    await AsyncStorage.setItem(ACTION_COUNT_KEY, count.toString());

    if (!TRIGGER_COUNTS.includes(count)) {
      return;
    }

    await StoreReview.requestReview();

    console.log(`[ReviewService] Review requested at count: ${count}`);
  } catch (error) {
    console.log('[ReviewService] Error requesting review:', error);
  }
};
