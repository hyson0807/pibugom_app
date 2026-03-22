import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { ToastConfig } from "react-native-toast-message";

const ICON_MAP = {
  success: { name: "checkmark-circle" as const, color: Colors.skinSuccess },
  error: { name: "close-circle" as const, color: Colors.skinError },
  info: { name: "information-circle" as const, color: Colors.skinPrimary },
};

function ToastContent({
  type,
  text1,
}: {
  type: keyof typeof ICON_MAP;
  text1?: string;
}) {
  const icon = ICON_MAP[type];
  return (
    <View style={styles.container}>
      <Ionicons name={icon.name} size={18} color={icon.color} />
      <Text style={styles.text} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (props) => <ToastContent type="success" text1={props.text1} />,
  error: (props) => <ToastContent type="error" text1={props.text1} />,
  info: (props) => <ToastContent type="info" text1={props.text1} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.skinSurface,
    borderWidth: 1,
    borderColor: Colors.skinBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 40,
    gap: 10,
  },
  text: {
    flex: 1,
    color: Colors.skinText,
    fontSize: 14,
    fontWeight: "500",
  },
});
