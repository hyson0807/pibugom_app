import "../global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/useAuthStore";
import { View, ActivityIndicator } from "react-native";

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
      if (rootSegment !== "(tabs)") {
        router.replace("/(tabs)/home");
      }
    }
  }, [isInitialized, isAuthenticated, isOnboarded, rootSegment]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF5F0", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#E87461" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="question/[id]"
          options={{
            headerShown: true,
            headerTitle: "질문 상세",
            headerBackTitle: "뒤로",
            headerTintColor: "#E87461",
            headerStyle: { backgroundColor: "#FFF5F0" },
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
