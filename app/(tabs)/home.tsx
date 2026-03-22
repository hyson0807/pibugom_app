import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { questionApi } from "../../services/questionApi";
import { SKIN_CATEGORIES } from "../../constants/skinCategories";
import { Colors } from "../../constants/colors";

export default function HomeScreen() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!category || !title.trim() || !content.trim()) {
      Alert.alert("알림", "카테고리, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await questionApi.create({ title: title.trim(), content: content.trim(), category });
      Alert.alert("완료", "질문이 등록되었습니다!");
      setCategory("");
      setTitle("");
      setContent("");
    } catch {
      Alert.alert("오류", "질문 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-skin-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1 px-5 pt-4">
          {/* Header */}
          <Text className="text-2xl font-bold text-skin-text mb-6">
            피부 고민 질문하기
          </Text>

          {/* Category selector */}
          <Text className="text-sm font-medium text-skin-text-secondary mb-2">
            카테고리
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
          >
            <View className="flex-row gap-2">
              {SKIN_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    className={`rounded-full px-4 py-2 ${
                      isSelected
                        ? "bg-skin-primary"
                        : "bg-skin-surface border border-skin-border"
                    }`}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-skin-text"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Title */}
          <Text className="text-sm font-medium text-skin-text-secondary mb-2">
            제목
          </Text>
          <TextInput
            className="bg-skin-surface border border-skin-border rounded-xl px-4 py-3 text-skin-text mb-4"
            placeholder="어떤 고민이 있나요?"
            placeholderTextColor={Colors.skinPlaceholder}
            value={title}
            onChangeText={setTitle}
          />

          {/* Content */}
          <Text className="text-sm font-medium text-skin-text-secondary mb-2">
            내용
          </Text>
          <TextInput
            className="bg-skin-surface border border-skin-border rounded-xl px-4 py-3 text-skin-text mb-6"
            placeholder="피부 고민을 자세히 적어주세요..."
            placeholderTextColor={Colors.skinPlaceholder}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ minHeight: 150 }}
          />

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-full py-4 items-center mb-8 ${
              category && title.trim() && content.trim()
                ? "bg-skin-primary"
                : "bg-skin-inactive"
            }`}
            onPress={handleSubmit}
            disabled={
              !category || !title.trim() || !content.trim() || isSubmitting
            }
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? "등록 중..." : "질문 올리기"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
