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
import { useState, useCallback } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { type Answer } from "../../services/questionApi";
import {
  useQuestion,
  useCreateAnswer,
  useDeleteQuestion,
} from "../../hooks/useQuestions";
import { useAuthStore } from "../../stores/useAuthStore";
import QuestionActionSheet from "../../components/QuestionActionSheet";
import { showToast } from "../../utils/toast";
import { timeAgo } from "../../utils/dateUtils";
import { Colors } from "../../constants/colors";

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [answerText, setAnswerText] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);

  const { data: question, isLoading, isError } = useQuestion(id);
  const createAnswer = useCreateAnswer();
  const deleteQuestion = useDeleteQuestion();

  const isMyQuestion = question?.userId === user?.id;

  const handleDelete = useCallback(() => {
    Alert.alert("삭제 확인", "이 질문을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteQuestion.mutate(id, {
            onSuccess: () => {
              showToast("success", "질문이 삭제되었습니다.");
              router.back();
            },
            onError: () => {
              showToast("error", "삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  }, [id, router, deleteQuestion]);

  const handleEdit = useCallback(() => {
    router.push(`/question/edit/${id}`);
  }, [id, router]);

  const handleSendAnswer = () => {
    if (!answerText.trim() || createAnswer.isPending) return;

    createAnswer.mutate(
      { questionId: id, content: answerText.trim() },
      {
        onSuccess: () => {
          setAnswerText("");
        },
        onError: () => {
          showToast("error", "답변 등록에 실패했습니다.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  if (isError || !question) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <Text className="text-skin-text-secondary">
          질문을 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  const renderAnswer = useCallback(
    ({ item }: { item: Answer }) => (
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
    ),
    []
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-skin-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {isMyQuestion && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setSheetVisible(true)}
                hitSlop={8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={Colors.skinPrimary}
                />
              </TouchableOpacity>
            ),
          }}
        />
      )}
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

      <View className="px-4 pt-3 pb-8 bg-skin-bg">
        <View className="flex-row items-center rounded-full border border-skin-border bg-skin-surface px-4">
          <TextInput
            className="flex-1 py-3 text-skin-text text-sm"
            placeholder="답변을 입력하세요..."
            placeholderTextColor={Colors.skinPlaceholder}
            value={answerText}
            onChangeText={setAnswerText}
            textAlignVertical="center"
            keyboardAppearance="dark"
          />
          <TouchableOpacity
            onPress={handleSendAnswer}
            disabled={!answerText.trim() || createAnswer.isPending}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-up-circle"
              size={28}
              color={answerText.trim() ? Colors.skinPrimary : Colors.skinInactive}
            />
          </TouchableOpacity>
        </View>
      </View>

      <QuestionActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </KeyboardAvoidingView>
  );
}
