import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBlockedUsers, useBlockUser } from "@/hooks/useUser";
import { showToast } from "@/utils/toast";
import { Colors } from "@/constants/colors";

interface BlockedUser {
  id: string;
  nickname: string | null;
  profileImage: string | null;
  blockedAt: string;
}

export default function BlockedUsersScreen() {
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const blockUser = useBlockUser();

  const handleUnblock = (user: BlockedUser) => {
    const name = user.nickname ?? "익명";
    Alert.alert("차단 해제", `${name}님의 차단을 해제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "해제",
        onPress: () => {
          blockUser.mutate(user.id, {
            onSuccess: () => showToast("success", "차단이 해제되었습니다."),
            onError: () => showToast("error", "차단 해제에 실패했습니다."),
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center py-4 border-b border-skin-border">
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-skin-border mr-3 items-center justify-center">
                <Ionicons
                  name="person"
                  size={20}
                  color={Colors.skinTextSecondary}
                />
              </View>
            )}
            <Text className="flex-1 text-base text-skin-text">
              {item.nickname ?? "익명"}
            </Text>
            <TouchableOpacity
              onPress={() => handleUnblock(item)}
              disabled={blockUser.isPending}
              className="px-4 py-2 rounded-full border border-skin-border"
              activeOpacity={0.7}
            >
              <Text className="text-sm text-skin-text-secondary">
                차단 해제
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center pt-20">
            <Text className="text-skin-text-secondary text-sm">
              차단한 사용자가 없습니다
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
