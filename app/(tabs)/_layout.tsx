import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E87461",
        tabBarInactiveTintColor: "#C4C4C4",
        tabBarStyle: { backgroundColor: "#FFF0E8" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "도와주기",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hand-left-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-questions"
        options={{
          title: "내 질문",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbox-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
