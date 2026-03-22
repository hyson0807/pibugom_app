import "../global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/colors";

const AUTHENTICATED_SEGMENTS = new Set(["(tabs)", "settings", "question", "edit-profile"]);

const detailHeaderOptions = {
  headerShown: true,
  headerBackTitle: "뒤로",
  headerTintColor: Colors.skinPrimary,
  headerStyle: { backgroundColor: Colors.skinBg },
};

export default function RootLayout() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const initialize = useAuthStore((s) => s.initialize);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      if (rootSegment !== "(auth)") {
        router.replace("/(auth)/login");
      }
    } else if (!isOnboarded) {
      if (rootSegment !== "(onboarding)") {
        router.replace("/(onboarding)/age");
      }
    } else {
      if (!AUTHENTICATED_SEGMENTS.has(rootSegment)) {
        router.replace("/(tabs)/help");
      }
    }
  }, [isInitialized, isAuthenticated, isOnboarded, rootSegment, router]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.skinBg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: "none" }} />
        <Stack.Screen name="(onboarding)" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen
          name="question/[id]"
          options={{ ...detailHeaderOptions, headerTitle: "질문 상세" }}
        />
        <Stack.Screen
          name="settings"
          options={{ ...detailHeaderOptions, headerTitle: "설정" }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ ...detailHeaderOptions, headerTitle: "프로필 수정" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
