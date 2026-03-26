import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { type Question } from "@/services/questionApi";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";

interface QuestionContentProps {
  question: Question;
  isMyQuestion: boolean;
  onToggleBookmark: () => void;
  onMenuPress: () => void;
}

export default memo(function QuestionContent({
  question,
  isMyQuestion,
  onToggleBookmark,
  onMenuPress,
}: QuestionContentProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        {question.user?.profileImage ? (
          <Image
            source={{ uri: question.user.profileImage }}
            className="w-8 h-8 rounded-full mr-2"
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-skin-border mr-2 items-center justify-center">
            <Ionicons
              name="person"
              size={16}
              color={Colors.skinTextSecondary}
            />
          </View>
        )}
        <Text className="text-sm font-medium text-skin-text">
          {question.user?.nickname ?? "익명"}
        </Text>
        <Text className="text-xs text-skin-text-secondary ml-2">
          {timeAgo(question.createdAt)}
        </Text>
        {!isMyQuestion && (
          <TouchableOpacity
            onPress={onMenuPress}
            hitSlop={8}
            className="ml-auto"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={16}
              color={Colors.skinTextSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-xl font-bold text-skin-text mb-2">
        {question.title}
      </Text>
      <Text className="text-base text-skin-text leading-6 mb-3">
        {question.content}
      </Text>
      {question.images && question.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {question.images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.imageUrl }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: Colors.skinSurface,
                }}
                resizeMode="cover"
              />
            ))}
          </View>
        </ScrollView>
      )}
      <View className="flex-row justify-end mb-3">
        <TouchableOpacity
          onPress={onToggleBookmark}
          hitSlop={8}
        >
          <Ionicons
            name={question.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={question.isBookmarked ? Colors.skinPrimary : Colors.skinTextSecondary}
          />
        </TouchableOpacity>
      </View>
      <View className="h-px bg-skin-border mb-2" />
      <Text className="text-sm font-semibold text-skin-text mb-2">
        답변 {question.answerCount ?? 0}개
      </Text>
    </View>
  );
});
