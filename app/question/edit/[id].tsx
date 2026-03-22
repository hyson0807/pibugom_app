import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuestion, useUpdateQuestion } from "../../../hooks/useQuestions";
import { showToast } from "../../../utils/toast";
import { SKIN_CATEGORIES } from "../../../constants/skinCategories";
import { Colors } from "../../../constants/colors";

export default function EditQuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: question, isLoading: isLoadingQuestion } = useQuestion(id);
  const updateQuestion = useUpdateQuestion();

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (question && !hasHydrated.current) {
      setCategory(question.category);
      setTitle(question.title);
      setContent(question.content);
      hasHydrated.current = true;
    }
  }, [question]);

  const handleSubmit = () => {
    if (!category || !title.trim() || !content.trim()) {
      showToast("info", "카테고리, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    updateQuestion.mutate(
      { id, data: { title: title.trim(), content: content.trim(), category } },
      {
        onSuccess: () => {
          showToast("success", "질문이 수정되었습니다!");
          router.back();
        },
        onError: () => {
          showToast("error", "수정에 실패했습니다.");
        },
      }
    );
  };

  if (isLoadingQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-skin-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ paddingHorizontal: 20, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category selector */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          카테고리
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {SKIN_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: isSelected
                      ? Colors.skinPrimary
                      : Colors.skinSurface,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: Colors.skinBorder,
                  }}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isSelected ? "#FFFFFF" : Colors.skinText,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Title */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          제목
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.skinSurface,
            borderWidth: 1,
            borderColor: Colors.skinBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: Colors.skinText,
            marginBottom: 16,
          }}
          placeholder="어떤 고민이 있나요?"
          placeholderTextColor={Colors.skinPlaceholder}
          value={title}
          onChangeText={setTitle}
          keyboardAppearance="dark"
        />

        {/* Content */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          내용
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.skinSurface,
            borderWidth: 1,
            borderColor: Colors.skinBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: Colors.skinText,
            marginBottom: 24,
            minHeight: 120,
          }}
          placeholder="피부 고민을 자세히 적어주세요..."
          placeholderTextColor={Colors.skinPlaceholder}
          value={content}
          keyboardAppearance="dark"
          onChangeText={setContent}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={{
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 40,
            backgroundColor:
              category && title.trim() && content.trim()
                ? Colors.skinPrimary
                : Colors.skinInactive,
          }}
          onPress={handleSubmit}
          disabled={
            !category || !title.trim() || !content.trim() || updateQuestion.isPending
          }
          activeOpacity={0.8}
        >
          <Text
            style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}
          >
            {updateQuestion.isPending ? "수정 중..." : "수정 완료"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
