import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/useAuthStore";
import { api } from "../services/api";

export default function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원탈퇴",
      "탈퇴하면 모든 데이터가 삭제되며 복구할 수 없어요.\n정말 탈퇴하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.delete("/users/me");
              await logout();
            } catch {
              setIsDeleting(false);
              Alert.alert("오류", "탈퇴 처리 중 문제가 발생했어요.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      <View className="flex-1 px-5 pt-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium text-skin-text">로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium text-skin-error">
            {isDeleting ? "처리 중..." : "회원탈퇴"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
