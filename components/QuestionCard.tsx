import { View, Text, TouchableOpacity } from "react-native";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { type Question } from "@/services/questionApi";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";

interface QuestionCardProps {
  item: Question;
  onPress: () => void;
  variant?: "default" | "search";
}

export default memo(function QuestionCard({
  item,
  onPress,
  variant = "default",
}: QuestionCardProps) {
  return (
    <TouchableOpacity
      className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        className="text-base font-semibold text-skin-text mb-1"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        className="text-sm text-skin-text-secondary mb-2"
        numberOfLines={2}
      >
        {item.content}
      </Text>
      <View className="flex-row items-center">
        {variant === "search" ? (
          <>
            {(item._count?.answers ?? 0) > 0 && (
              <>
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={Colors.skinTextSecondary}
                />
                <Text className="text-xs text-skin-primary ml-1 mr-2 font-medium">
                  {item._count?.answers}
                </Text>
              </>
            )}
            <Text className="text-xs text-skin-text-secondary">
              {timeAgo(item.createdAt)}
            </Text>
            <Text className="text-xs text-skin-text-secondary ml-2">
              {item.user?.nickname ?? "익명"}
            </Text>
          </>
        ) : (
          <>
            <Text className="text-xs text-skin-text-secondary">
              {item.user?.nickname ?? "익명"}
            </Text>
            <Text className="text-xs text-skin-text-secondary ml-2">
              {timeAgo(item.createdAt)}
            </Text>
            <Text className="text-xs text-skin-primary ml-auto font-medium">
              답변 {item._count?.answers ?? 0}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
});
