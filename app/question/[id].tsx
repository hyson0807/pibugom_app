import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  questionApi,
  type Question,
  type Answer,
} from "../../services/questionApi";
import { timeAgo } from "../../utils/dateUtils";
import { Colors } from "../../constants/colors";

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchQuestion = async () => {
    try {
      const data = await questionApi.getOne(id);
      setQuestion(data);
    } catch {
      Alert.alert("오류", "질문을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const handleSendAnswer = async () => {
    if (!answerText.trim() || isSending) return;
    setIsSending(true);

    try {
      const newAnswer = await questionApi.createAnswer(id, answerText.trim());
      setQuestion((prev) =>
        prev
          ? { ...prev, answers: [...(prev.answers ?? []), newAnswer] }
          : prev
      );
      setAnswerText("");
    } catch {
      Alert.alert("오류", "답변 등록에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  if (!question) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <Text className="text-skin-text-secondary">
          질문을 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  const renderAnswer = ({ item }: { item: Answer }) => (
    <View className="bg-skin-surface rounded-xl p-4 mb-2 border border-skin-border">
      <View className="flex-row items-center mb-2">
        <Text className="text-sm font-medium text-skin-text">
          {item.user.nickname ?? "익명"}
        </Text>
        <Text className="text-xs text-skin-text-secondary ml-auto">
          {timeAgo(item.createdAt)}
        </Text>
      </View>
      <Text className="text-sm text-skin-text leading-5">{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-skin-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={question.answers ?? []}
        renderItem={renderAnswer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
        ListHeaderComponent={
          <View className="mb-6">
            {/* Category */}
            <View className="bg-skin-primary/10 rounded-full px-3 py-1 self-start mb-3">
              <Text className="text-xs font-medium text-skin-primary">
                {question.category}
              </Text>
            </View>
            {/* Title */}
            <Text className="text-xl font-bold text-skin-text mb-2">
              {question.title}
            </Text>
            {/* Meta */}
            <View className="flex-row items-center mb-3">
              <Text className="text-sm text-skin-text-secondary">
                {question.user?.nickname ?? "익명"}
              </Text>
              <Text className="text-sm text-skin-text-secondary mx-2">
                ·
              </Text>
              <Text className="text-sm text-skin-text-secondary">
                {timeAgo(question.createdAt)}
              </Text>
            </View>
            {/* Content */}
            <Text className="text-base text-skin-text leading-6 mb-4">
              {question.content}
            </Text>
            {/* Divider */}
            <View className="h-px bg-skin-border mb-2" />
            <Text className="text-sm font-semibold text-skin-text mb-2">
              답변 {question.answers?.length ?? 0}개
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-skin-text-secondary text-sm">
              아직 답변이 없어요. 첫 답변을 남겨보세요!
            </Text>
          </View>
        }
      />

      {/* Answer input */}
      <View className="flex-row items-center px-4 py-3 bg-skin-surface border-t border-skin-border">
        <TextInput
          className="flex-1 bg-skin-bg rounded-full px-4 py-2 text-skin-text mr-2 border border-skin-border"
          placeholder="답변을 입력하세요..."
          placeholderTextColor={Colors.skinPlaceholder}
          value={answerText}
          onChangeText={setAnswerText}
          multiline
        />
        <TouchableOpacity
          className={`rounded-full p-2 ${
            answerText.trim() ? "bg-skin-primary" : "bg-skin-inactive"
          }`}
          onPress={handleSendAnswer}
          disabled={!answerText.trim() || isSending}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
