import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="help" />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="my-questions" />
    </Tabs>
  );
}
