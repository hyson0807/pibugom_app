import { View, Text, TouchableOpacity, Image } from "react-native";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { type Answer } from "@/services/questionApi";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";

export type FlatAnswer = Answer & { depth: number };

export interface AnswerItemProps {
  item: FlatAnswer;
  currentUserId: string | undefined;
  questionUserId: string;
  onReply: (parentId: string, nickname: string, mention: boolean) => void;
  onMenuPress: (item: Answer) => void;
}

export default memo(function AnswerItem({
  item,
  currentUserId,
  questionUserId,
  onReply,
  onMenuPress,
}: AnswerItemProps) {
  const isDeleted = !!item.deletedAt;
  const isAuthor = item.userId === questionUserId;
  const isReply = item.depth === 1;
  const displayNickname = item.user.nickname ?? "익명";

  if (isDeleted) {
    const deletedText = (
      <Text className="text-sm text-skin-text-secondary">
        삭제된 댓글입니다
      </Text>
    );

    if (isReply) {
      return (
        <View className="mb-3 pl-10 flex-row">
          <Ionicons
            name="return-down-forward-outline"
            size={16}
            color={Colors.skinTextSecondary}
            style={{ marginRight: 8, marginTop: 4 }}
          />
          <View className="flex-1 bg-skin-surface rounded-xl p-3 border border-skin-border">
            {deletedText}
          </View>
        </View>
      );
    }

    return (
      <View className="mb-3 py-2">{deletedText}</View>
    );
  }

  const content = (
    <>
      <View className="flex-row items-center mb-1">
        {item.user.profileImage ? (
          <Image
            source={{ uri: item.user.profileImage }}
            className="w-6 h-6 rounded-full mr-2"
          />
        ) : (
          <View className="w-6 h-6 rounded-full bg-skin-border mr-2 items-center justify-center">
            <Ionicons
              name="person"
              size={14}
              color={Colors.skinTextSecondary}
            />
          </View>
        )}
        <Text
          className={`text-sm font-medium ${
            isAuthor ? "text-skin-primary" : "text-skin-text"
          }`}
        >
          {isAuthor ? `${displayNickname}(글쓴이)` : displayNickname}
        </Text>
        <View className="ml-auto flex-row items-center">
          <TouchableOpacity
            onPress={() =>
              onReply(
                isReply ? item.parentId! : item.id,
                displayNickname,
                isReply
              )
            }
            hitSlop={8}
            className="mr-3"
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={Colors.skinTextSecondary}
            />
          </TouchableOpacity>
          {currentUserId && (
            <TouchableOpacity
              onPress={() => onMenuPress(item)}
              hitSlop={8}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={16}
                color={Colors.skinTextSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text className="text-sm text-skin-text leading-5">{item.content}</Text>
      <Text className="text-xs text-skin-text-secondary mt-1">
        {timeAgo(item.createdAt)}
      </Text>
    </>
  );

  if (isReply) {
    return (
      <View className="mb-3 pl-10 flex-row">
        <Ionicons
          name="return-down-forward-outline"
          size={16}
          color={Colors.skinTextSecondary}
          style={{ marginRight: 8, marginTop: 4 }}
        />
        <View className="flex-1 bg-skin-surface rounded-xl p-3 border border-skin-border">
          {content}
        </View>
      </View>
    );
  }

  return <View className="mb-3 py-2">{content}</View>;
});
