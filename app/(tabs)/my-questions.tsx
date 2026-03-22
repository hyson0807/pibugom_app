import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { questionApi, type Question } from "../../services/questionApi";
import { useAuthStore } from "../../stores/useAuthStore";
import { timeAgo } from "../../utils/dateUtils";
import { Colors } from "../../constants/colors";

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  OTHER: "기타",
};

export default function MyQuestionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchQuestions = useCallback(async (p = 1, refresh = false) => {
    try {
      setHasError(false);
      const data = await questionApi.getMy({ page: p, limit: 20 });
      if (refresh || p === 1) {
        setQuestions(data.questions);
      } else {
        setQuestions((prev) => [...prev, ...data.questions]);
      }
      setTotalPages(data.totalPages);
      setPage(p);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      Promise.all([fetchProfile(), fetchQuestions(1, true)]);
    }, [fetchProfile, fetchQuestions])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([fetchProfile(), fetchQuestions(1, true)]);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchQuestions(page + 1);
    }
  };

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (user?.birthYear) {
      parts.push(`${new Date().getFullYear() - user.birthYear}세`);
    }
    if (user?.gender) {
      parts.push(GENDER_LABEL[user.gender] ?? user.gender);
    }
    return parts.join(" · ");
  }, [user?.birthYear, user?.gender]);

  const renderProfileHeader = useCallback(
    () => (
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-bold text-skin-text">
              {user?.nickname ?? "닉네임 없음"}
            </Text>
            {subtitle ? (
              <Text className="text-sm text-skin-text-secondary mt-1">
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-skin-surface items-center justify-center border border-skin-border">
                <Ionicons
                  name="person"
                  size={36}
                  color={Colors.skinTextSecondary}
                />
              </View>
            )}
          </View>
        </View>

        {user?.skinConcerns && user.skinConcerns.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {user.skinConcerns.map((concern) => (
              <View
                key={concern}
                className="bg-skin-primary/10 rounded-full px-3 py-1.5"
              >
                <Text className="text-xs font-medium text-skin-primary">
                  {concern}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          className="border border-skin-border rounded-xl py-2.5 items-center mb-4"
          onPress={() => router.push("/edit-profile")}
          activeOpacity={0.7}
        >
          <Text className="text-sm font-medium text-skin-text">
            프로필 수정
          </Text>
        </TouchableOpacity>

        <View className="border-t border-skin-border pt-4">
          <Text className="text-base font-semibold text-skin-text">
            내 질문
          </Text>
        </View>
      </View>
    ),
    [user, subtitle, router]
  );

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
      <Text
        className="text-base font-semibold text-skin-text mb-1"
        numberOfLines={1}
      >
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
      <View className="px-5 pt-4 mb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-skin-text">프로필</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          hitSlop={8}
        >
          <Ionicons name="menu-outline" size={28} color={Colors.skinText} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.skinPrimary} />
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListHeaderComponent={renderProfileHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.skinPrimary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            hasError ? (
              <View className="items-center py-20">
                <Text className="text-skin-text-secondary text-base mb-3">
                  불러오기에 실패했어요
                </Text>
                <TouchableOpacity onPress={() => fetchQuestions(1, true)}>
                  <Text className="text-skin-primary text-sm font-medium">
                    다시 시도
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center py-20">
                <Text className="text-skin-text-secondary text-base">
                  아직 질문이 없어요
                </Text>
                <Text className="text-skin-text-secondary text-sm mt-1">
                  홈에서 피부 고민을 질문해보세요!
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
