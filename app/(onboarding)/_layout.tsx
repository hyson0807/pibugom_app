import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1A1A2E" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="age" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="skin-concerns" />
    </Stack>
  );
}
