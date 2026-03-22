import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { questionApi, type Question } from "../../services/questionApi";
import { timeAgo } from "../../utils/dateUtils";

export default function MyQuestionsScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQuestions = useCallback(async (p = 1, refresh = false) => {
    try {
      const data = await questionApi.getMy({ page: p, limit: 20 });
      if (refresh || p === 1) {
        setQuestions(data.questions);
      } else {
        setQuestions((prev) => [...prev, ...data.questions]);
      }
      setTotalPages(data.totalPages);
      setPage(p);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions(1, true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchQuestions(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchQuestions(page + 1);
    }
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
      onPress={() => router.push(`/question/${item.id}`)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-2">
        <View className="bg-skin-primary/10 rounded-full px-3 py-1">
          <Text className="text-xs font-medium text-skin-primary">
            {item.category}
          </Text>
        </View>
        <Text className="text-xs text-skin-text-secondary ml-auto">
          {timeAgo(item.createdAt)}
        </Text>
      </View>
      <Text className="text-base font-semibold text-skin-text mb-1" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-sm text-skin-text-secondary" numberOfLines={2}>
        {item.content}
      </Text>
      <View className="flex-row items-center mt-2">
        <View className="bg-skin-accent/20 rounded-full px-3 py-1">
          <Text className="text-xs font-medium text-skin-accent">
            답변 {item._count?.answers ?? 0}개
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-skin-bg">
      <View className="px-5 pt-4 mb-2">
        <Text className="text-2xl font-bold text-skin-text">내 질문</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#E87461" />
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#E87461"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-skin-text-secondary text-base">
                아직 질문이 없어요
              </Text>
              <Text className="text-skin-text-secondary text-sm mt-1">
                홈에서 피부 고민을 질문해보세요!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
