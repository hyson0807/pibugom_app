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
  Keyboard,
  Image,
} from "react-native";
import { useState, useCallback, useMemo, memo } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { type Answer } from "../../services/questionApi";
import {
  useQuestion,
  useCreateAnswer,
  useDeleteQuestion,
  useDeleteAnswer,
} from "../../hooks/useQuestions";
import { useAuthStore } from "../../stores/useAuthStore";
import QuestionActionSheet from "../../components/QuestionActionSheet";
import AnswerActionSheet from "../../components/AnswerActionSheet";
import { showToast } from "../../utils/toast";
import { timeAgo } from "../../utils/dateUtils";
import { Colors } from "../../constants/colors";

type FlatAnswer = Answer & { depth: number };

interface AnswerItemProps {
  item: FlatAnswer;
  currentUserId: string | undefined;
  questionUserId: string;
  onReply: (id: string, nickname: string) => void;
  onMenuPress: (item: Answer) => void;
}

const AnswerItem = memo(function AnswerItem({
  item,
  currentUserId,
  questionUserId,
  onReply,
  onMenuPress,
}: AnswerItemProps) {
  const isDeleted = !!item.deletedAt;
  const isMyAnswer = item.userId === currentUserId;
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
          {!isReply && (
            <TouchableOpacity
              onPress={() => onReply(item.id, displayNickname)}
              hitSlop={8}
              className="mr-3"
            >
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={Colors.skinTextSecondary}
              />
            </TouchableOpacity>
          )}
          {isMyAnswer && (
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

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [answerText, setAnswerText] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    nickname: string;
  } | null>(null);
  const [answerSheetTarget, setAnswerSheetTarget] = useState<Answer | null>(
    null
  );

  const { data: question, isLoading, isError } = useQuestion(id);
  const createAnswer = useCreateAnswer();
  const deleteQuestion = useDeleteQuestion();
  const deleteAnswer = useDeleteAnswer();

  const isMyQuestion = question?.userId === user?.id;

  const flattenedAnswers = useMemo(() => {
    const result: FlatAnswer[] = [];
    for (const answer of question?.answers ?? []) {
      result.push({ ...answer, depth: 0 });
      for (const reply of answer.replies ?? []) {
        result.push({ ...reply, depth: 1 });
      }
    }
    return result;
  }, [question?.answers]);

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

  const handleReply = useCallback(
    (answerId: string, nickname: string) => {
      setReplyingTo({ id: answerId, nickname });
    },
    []
  );

  const handleMenuPress = useCallback((item: Answer) => {
    setAnswerSheetTarget(item);
  }, []);

  const handleSendAnswer = () => {
    if (!answerText.trim() || createAnswer.isPending) return;
    Keyboard.dismiss();

    createAnswer.mutate(
      {
        questionId: id,
        content: answerText.trim(),
        parentId: replyingTo?.id,
      },
      {
        onSuccess: () => {
          setAnswerText("");
          setReplyingTo(null);
        },
        onError: () => {
          showToast("error", "답변 등록에 실패했습니다.");
        },
      }
    );
  };

  const handleDeleteAnswer = useCallback(() => {
    if (!answerSheetTarget) return;
    Alert.alert("삭제 확인", "이 답변을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteAnswer.mutate(
            { questionId: id, answerId: answerSheetTarget.id },
            {
              onSuccess: () => showToast("success", "답변이 삭제되었습니다."),
              onError: () => showToast("error", "삭제에 실패했습니다."),
            }
          );
        },
      },
    ]);
  }, [answerSheetTarget, id, deleteAnswer]);

  const renderAnswer = useCallback(
    ({ item }: { item: FlatAnswer }) => (
      <AnswerItem
        item={item}
        currentUserId={user?.id}
        questionUserId={question?.userId ?? ""}
        onReply={handleReply}
        onMenuPress={handleMenuPress}
      />
    ),
    [user?.id, question?.userId, handleReply, handleMenuPress]
  );

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
        data={flattenedAnswers}
        renderItem={renderAnswer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
        ListHeaderComponent={
          <View className="mb-6">
            <View className="bg-skin-primary/10 rounded-full px-3 py-1 self-start mb-3">
              <Text className="text-xs font-medium text-skin-primary">
                {question.category}
              </Text>
            </View>
            <Text className="text-xl font-bold text-skin-text mb-2">
              {question.title}
            </Text>
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
            <Text className="text-base text-skin-text leading-6 mb-4">
              {question.content}
            </Text>
            <View className="h-px bg-skin-border mb-2" />
            <Text className="text-sm font-semibold text-skin-text mb-2">
              답변 {question.answerCount ?? 0}개
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
        {replyingTo && (
          <View className="flex-row items-center mb-2 px-1">
            <Text className="text-xs text-skin-text-secondary">
              {replyingTo.nickname}님에게 답글 작성 중
            </Text>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
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
          <TextInput
            className="flex-1 py-3 text-skin-text text-sm"
            placeholder={
              replyingTo
                ? `${replyingTo.nickname}님에게 답글...`
                : "답변을 입력하세요..."
            }
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
              color={
                answerText.trim() ? Colors.skinPrimary : Colors.skinInactive
              }
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

      <AnswerActionSheet
        visible={!!answerSheetTarget}
        onClose={() => setAnswerSheetTarget(null)}
        onDelete={handleDeleteAnswer}
      />
    </KeyboardAvoidingView>
  );
}
