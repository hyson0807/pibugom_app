import { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import QuestionBottomSheet from "./QuestionBottomSheet";

const TAB_CONFIG: Record<string, { icon: "hand-left-outline" | "person-outline"; label: string }> = {
  help: { icon: "hand-left-outline", label: "도와주기" },
  "my-questions": { icon: "person-outline", label: "프로필" },
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  // Only show routes with tab config
  const visibleRoutes = state.routes.filter((r) => TAB_CONFIG[r.name]);

  return (
    <View style={styles.container}>
      {/* Left tab */}
      {visibleRoutes[0] && (
        <TabButton
          route={visibleRoutes[0]}
          isFocused={state.routes[state.index].key === visibleRoutes[0].key}
          navigation={navigation}
        />
      )}

      {/* Center "+" button */}
      <TouchableOpacity
        style={styles.centerWrapper}
        onPress={() => setSheetVisible(true)}
      >
        <View style={styles.centerButton}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
        <Text style={[styles.label, { color: Colors.skinPrimary }]}>
          질문하기
        </Text>
      </TouchableOpacity>

      {/* Right tab */}
      {visibleRoutes[1] && (
        <TabButton
          route={visibleRoutes[1]}
          isFocused={state.routes[state.index].key === visibleRoutes[1].key}
          navigation={navigation}
        />
      )}

      <QuestionBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

function TabButton({
  route,
  isFocused,
  navigation,
}: {
  route: BottomTabBarProps["state"]["routes"][number];
  isFocused: boolean;
  navigation: BottomTabBarProps["navigation"];
}) {
  const config = TAB_CONFIG[route.name];
  if (!config) return null;

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={() => {
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      }}
    >
      <Ionicons
        name={config.icon}
        size={24}
        color={isFocused ? Colors.skinPrimary : Colors.skinInactive}
      />
      <Text
        style={[
          styles.label,
          { color: isFocused ? Colors.skinPrimary : Colors.skinInactive },
        ]}
      >
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.skinTab,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.skinBorder,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -20,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.skinPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.skinPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
});
