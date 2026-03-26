import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface AnswerInputProps {
  answerText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isPending: boolean;
  replyingTo: { nickname: string; mention: boolean } | null;
  onCancelReply: () => void;
  isAnonymous: boolean;
  onToggleAnonymous: () => void;
}

export default memo(function AnswerInput({
  answerText,
  onChangeText,
  onSend,
  isPending,
  replyingTo,
  onCancelReply,
  isAnonymous,
  onToggleAnonymous,
}: AnswerInputProps) {
  const replyDisplayName = replyingTo?.mention
    ? `@${replyingTo.nickname}`
    : replyingTo?.nickname;
  const hasText = answerText.trim().length > 0;

  return (
    <View className="px-4 pt-3 pb-8 bg-skin-bg">
      {replyingTo && (
        <View className="flex-row items-center mb-2 px-1">
          <Text className="text-xs text-skin-text-secondary">
            {replyDisplayName}님에게 답글 작성 중
          </Text>
          <TouchableOpacity
            onPress={onCancelReply}
            className="ml-2"
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={Colors.skinTextSecondary}
            />
          </TouchableOpacity>
        </View>
      )}
      <View className="flex-row items-center rounded-full border border-skin-border bg-skin-surface px-4">
        <TouchableOpacity
          onPress={onToggleAnonymous}
          hitSlop={4}
          className="flex-row items-center mr-2"
        >
          <Ionicons
            name={isAnonymous ? "checkbox" : "square-outline"}
            size={18}
            color={isAnonymous ? Colors.skinPrimary : Colors.skinTextSecondary}
          />
          <Text
            style={{
              marginLeft: 3,
              fontSize: 12,
              fontWeight: "600",
              color: isAnonymous ? Colors.skinPrimary : Colors.skinTextSecondary,
            }}
          >
            익명
          </Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 py-3 text-skin-text text-sm"
          placeholder={
            replyingTo
              ? `${replyDisplayName}님에게 답글...`
              : "답변을 입력하세요..."
          }
          placeholderTextColor={Colors.skinPlaceholder}
          value={answerText}
          onChangeText={onChangeText}
          textAlignVertical="center"
          keyboardAppearance="dark"
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={!hasText || isPending}
          hitSlop={8}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={Colors.skinPrimary} />
          ) : (
            <Ionicons
              name="arrow-up-circle"
              size={28}
              color={hasText ? Colors.skinPrimary : Colors.skinInactive}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});
