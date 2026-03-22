import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as AuthSession from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "../../stores/useAuthStore";
import { api } from "../../services/api";
import { Colors } from "../../constants/colors";
import { showToast } from "../../utils/toast";

WebBrowser.maybeCompleteAuthSession();

export default function WelcomeScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const handleSignIn = async () => {
      try {
        const idToken = response.authentication?.idToken;
        const accessToken = response.authentication?.accessToken;

        if (!idToken && !accessToken) {
          showToast("error", "Google 인증에 실패했습니다.");
          return;
        }

        const { data } = await api.post("/auth/google", {
          idToken,
          accessToken,
        });
        await login(data.accessToken, data.refreshToken, data.isOnboarded);

        if (data.isOnboarded) {
          router.replace("/(tabs)/help");
        } else {
          router.replace("/(onboarding)/age");
        }
      } catch {
        showToast("error", "로그인 중 문제가 발생했습니다.");
      }
    };

    handleSignIn();
  }, [response]);

  return (
    <LinearGradient
      colors={[Colors.skinGradientStart, Colors.skinPrimary, Colors.skinGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoSection}>
        <Text style={styles.title}>피부곰</Text>
        <Text style={styles.subtitle}>피부 고민, 함께 나눠요</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={!request}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={20} color={Colors.skinTextDark} />
          <Text style={styles.googleButtonText}>Google로 시작하기</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          계속하면 이용약관 및 개인정보처리방침에 동의하게 됩니다
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "white",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  bottomSection: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  googleButton: {
    backgroundColor: "white",
    borderRadius: 9999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.skinTextDark,
    marginLeft: 12,
  },
  termsText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
});
