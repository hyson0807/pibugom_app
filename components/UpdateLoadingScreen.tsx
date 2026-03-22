import { View, Text, Image, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import { Colors } from "@/constants/colors";

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ]);

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: Colors.skinPrimary,
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
}

export function UpdateLoadingScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: Colors.skinBg,
        opacity: fadeAnim,
      }}
    >
      <Image
        source={require("@/assets/icon.png")}
        style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16 }}
        resizeMode="contain"
      />

      <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.skinText, marginBottom: 40 }}>
        피부곰
      </Text>

      <LoadingDots />

      <Text style={{ marginTop: 32, fontSize: 16, fontWeight: "500", color: Colors.skinText }}>
        더 나은 피부곰을 준비하고 있어요
      </Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: Colors.skinTextSecondary }}>
        잠시만 기다려주세요
      </Text>
    </Animated.View>
  );
}
