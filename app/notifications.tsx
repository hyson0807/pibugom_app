import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { timeAgo } from "@/utils/dateUtils";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/services/notificationApi";

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.notifications) ?? [],
    [data]
  );

  const handlePress = useCallback(
    (item: NotificationItem) => {
      if (!item.isRead) {
        markAsRead.mutate(item.id);
      }
      router.push(`/question/${item.questionId}`);
    },
    [markAsRead, router]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <TouchableOpacity
        className={`flex-row items-center px-5 py-4 border-b border-skin-border ${
          item.isRead ? "bg-skin-bg" : "bg-skin-surface"
        }`}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        {item.actor.profileImage ? (
          <Image
            source={{ uri: item.actor.profileImage }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-skin-surface items-center justify-center border border-skin-border mr-3">
            <Ionicons
              name="person"
              size={18}
              color={Colors.skinTextSecondary}
            />
          </View>
        )}

        <View className="flex-1">
          <Text
            className={`text-sm ${
              item.isRead ? "text-skin-text-secondary" : "text-skin-text"
            }`}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text className="text-xs text-skin-text-secondary mt-1">
            {timeAgo(item.createdAt)}
          </Text>
        </View>

        {!item.isRead && (
          <View className="w-2 h-2 bg-red-500 rounded-full ml-2" />
        )}
      </TouchableOpacity>
    ),
    [handlePress]
  );

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      {items.length > 0 && (
        <View className="px-5 py-2 flex-row justify-end border-b border-skin-border">
          <TouchableOpacity onPress={() => markAllAsRead.mutate()}>
            <Text className="text-sm text-skin-primary">모두 읽음</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.skinPrimary} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={Colors.skinTextSecondary}
              />
              <Text className="text-skin-text-secondary text-base mt-4">
                아직 알림이 없어요
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
