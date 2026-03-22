import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export function showToast(type: ToastType, text: string) {
  Toast.show({ type, text1: text, visibilityTime: 2000 });
}
