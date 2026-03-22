import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.skinPrimary,
        tabBarInactiveTintColor: Colors.skinInactive,
        tabBarStyle: { backgroundColor: Colors.skinTab },
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
          title: "프로필",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
