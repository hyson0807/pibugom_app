import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.skinBg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="age" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="skin-concerns" />
    </Stack>
  );
}
