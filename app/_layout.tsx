import "@/global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ToastConfig";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAppUpdates } from "@/hooks/useAppUpdates";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { UpdateLoadingScreen } from "@/components/UpdateLoadingScreen";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/colors";

const AUTHENTICATED_SEGMENTS = new Set(["(tabs)", "settings", "question", "edit-profile", "blocked-users", "search", "notifications"]);

const detailHeaderOptions = {
  headerShown: true,
  headerBackButtonDisplayMode: "minimal" as const,
  headerTintColor: Colors.skinPrimary,
  headerStyle: { backgroundColor: Colors.skinBg },
  headerTitleStyle: { fontSize: 15 },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppContent() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const initialize = useAuthStore((s) => s.initialize);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  usePushNotifications();

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
    <>
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
          name="question/edit/[id]"
          options={{ ...detailHeaderOptions, headerTitle: "질문 수정" }}
        />
        <Stack.Screen
          name="settings"
          options={{ ...detailHeaderOptions, headerTitle: "설정" }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ ...detailHeaderOptions, headerTitle: "프로필 수정" }}
        />
        <Stack.Screen
          name="blocked-users"
          options={{ ...detailHeaderOptions, headerTitle: "차단 목록" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ ...detailHeaderOptions, headerTitle: "알림" }}
        />
        <Stack.Screen
          name="search"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  const { isUpdating } = useAppUpdates();

  if (isUpdating) {
    return (
      <SafeAreaProvider>
        <UpdateLoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
