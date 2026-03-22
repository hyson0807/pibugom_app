import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDeleteAccount } from "@/hooks/useUser";
import { showToast } from "@/utils/toast";
import { Colors } from "@/constants/colors";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const INFO_LINKS = [
  { label: "커뮤니티 가이드라인", url: "https://hyson.kr/pibugom/community-guidelines" },
  { label: "서비스 이용약관", url: "https://hyson.kr/pibugom/terms" },
  { label: "개인정보처리방침", url: "https://hyson.kr/pibugom/privacy" },
  { label: "오픈소스 라이선스", url: "https://hyson.kr/pibugom/licenses" },
];

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useDeleteAccount();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          queryClient.clear();
          logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원탈퇴",
      "탈퇴하면 개인정보가 삭제되며 복구할 수 없어요.\n작성한 글과 댓글은 익명으로 유지돼요.\n정말 탈퇴하시겠어요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => {
            deleteAccount.mutate(undefined, {
              onError: () => {
                showToast("error", "탈퇴 처리 중 문제가 발생했어요.");
              },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5">
        {/* 계정 정보 */}
        <View className="pt-6 pb-2">
          <Text className="text-lg font-bold text-skin-text mb-2">계정</Text>
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-base text-skin-text">이메일</Text>
            <Text className="text-base text-skin-text-secondary">
              {user?.email ?? "-"}
            </Text>
          </View>
        </View>

        <View className="border-t border-skin-border" />

        {/* 이용 안내 */}
        <View className="pt-6 pb-2">
          <Text className="text-lg font-bold text-skin-text mb-2">
            이용 안내
          </Text>

          {INFO_LINKS.map(({ label, url }) => (
            <TouchableOpacity
              key={url}
              className="flex-row items-center justify-between py-4"
              onPress={() => Linking.openURL(url).catch(() => showToast("error", "링크를 열 수 없어요."))}
              activeOpacity={0.7}
            >
              <Text className="text-base text-skin-text">{label}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.skinTextSecondary}
              />
            </TouchableOpacity>
          ))}

          <View className="flex-row items-center justify-between py-4">
            <Text className="text-base text-skin-text">앱 버전</Text>
            <Text className="text-base text-skin-text-secondary">
              {APP_VERSION}
            </Text>
          </View>
        </View>

        <View className="border-t border-skin-border" />

        {/* 계정 관리 */}
        <View className="pt-6 pb-10">
          <Text className="text-lg font-bold text-skin-text mb-2">
            계정 관리
          </Text>

          <TouchableOpacity
            className="py-4"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text className="text-base text-skin-text">로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4"
            onPress={handleDeleteAccount}
            disabled={deleteAccount.isPending}
            activeOpacity={0.7}
          >
            <Text className="text-base text-skin-error">
              {deleteAccount.isPending ? "처리 중..." : "회원탈퇴"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
