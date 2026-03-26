import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type Question } from "@/services/questionApi";
import { useMyQuestions, useMyAnswers, useMyBookmarks } from "@/hooks/useQuestions";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/useAuthStore";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";
import { GENDER_LABEL } from "@/constants/genders";
import { SKINCARE_CATEGORIES } from "@/constants/skincareCategories";

type Tab = "questions" | "answers" | "bookmarks";

const TABS: { id: Tab; label: string }[] = [
  { id: "questions", label: "내 질문" },
  { id: "answers", label: "내 도움" },
  { id: "bookmarks", label: "북마크" },
];

const EMPTY_MESSAGES: Record<Tab, { title: string; subtitle: string }> = {
  questions: { title: "아직 질문이 없어요", subtitle: "홈에서 피부 고민을 질문해보세요!" },
  answers: { title: "아직 답변한 질문이 없어요", subtitle: "도와주기 탭에서 다른 사람의 고민에 답변해보세요!" },
  bookmarks: { title: "아직 북마크한 질문이 없어요", subtitle: "관심있는 질문을 북마크해보세요!" },
};

export default function MyQuestionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [activeTab, setActiveTab] = useState<Tab>("questions");

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const questionsQuery = useMyQuestions();
  const answersQuery = useMyAnswers();
  const bookmarksQuery = useMyBookmarks();

  const queryMap = { questions: questionsQuery, answers: answersQuery, bookmarks: bookmarksQuery };
  const activeQuery = queryMap[activeTab];
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage } = activeQuery;

  const [refreshing, setRefreshing] = useState(false);

  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.questions) ?? [],
    [data]
  );

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      refetchRef.current();
    }, [fetchProfile])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), refetch()]);
    setRefreshing(false);
  }, [fetchProfile, refetch]);

  const subtitle = user?.gender ? GENDER_LABEL[user.gender] ?? user.gender : "";

  const renderProfileHeader = useCallback(
    () => (
      <View className="mb-4">
        <View className="flex-row items-center mb-4 pt-4">
          <TouchableOpacity
            className="mr-5"
            onPress={() => router.push("/edit-profile")}
            activeOpacity={0.7}
          >
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
              <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-skin-primary items-center justify-center">
                <Ionicons name="pencil" size={12} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>

          <View>
            <Text className="text-2xl font-bold text-skin-text">
              {user?.nickname ?? "닉네임 없음"}
            </Text>
            {subtitle ? (
              <Text className="text-sm text-skin-text-secondary mt-1">
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {user?.skincareProducts &&
          SKINCARE_CATEGORIES.some(
            (cat) => user.skincareProducts?.[cat.key]?.length
          ) && (
            <View className="bg-skin-surface border border-skin-border rounded-2xl px-4 py-3.5 mb-4">
              {SKINCARE_CATEGORIES.filter(
                (cat) => user.skincareProducts?.[cat.key]?.length
              ).map((cat, idx, arr) => {
                const items = user.skincareProducts?.[cat.key]!;
                const isLast = idx === arr.length - 1;
                return (
                  <View
                    key={cat.key}
                    className={`flex-row items-start ${isLast ? "" : "mb-3"}`}
                  >
                    <View className="flex-row items-center mr-3 pt-0.5" style={{ minWidth: 64 }}>
                      <Ionicons
                        name={cat.icon}
                        size={14}
                        color={Colors.skinPrimary}
                      />
                      <Text className="text-xs font-semibold text-skin-text-secondary ml-1.5">
                        {cat.label}
                      </Text>
                    </View>
                    <View className="flex-1 flex-row flex-wrap gap-1.5">
                      {items.map((name, i) => (
                        <View
                          key={i}
                          className="bg-skin-bg rounded-full px-3 py-1"
                        >
                          <Text className="text-xs text-skin-text">{name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        <View className="border-t border-skin-border pt-2">
          <View className="flex-row">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                className="flex-1 items-center py-2"
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-semibold ${
                    activeTab === tab.id
                      ? "text-skin-primary"
                      : "text-skin-text-secondary"
                  }`}
                >
                  {tab.label}
                </Text>
                {activeTab === tab.id && (
                  <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-skin-primary rounded-full" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    ),
    [user, subtitle, router, activeTab]
  );

  const renderQuestion = useCallback(({ item }: { item: Question }) => (
    <TouchableOpacity
      className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
      onPress={() => router.push(`/question/${item.id}`)}
      activeOpacity={0.7}
    >
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
        <Text className="text-xs text-skin-text-secondary">
          {item.user?.nickname ?? "익명"}
        </Text>
        <Text className="text-xs text-skin-text-secondary ml-2">
          {timeAgo(item.createdAt)}
        </Text>
        <Text className="text-xs text-skin-primary ml-auto font-medium">
          답변 {item._count?.answers ?? 0}
        </Text>
      </View>
    </TouchableOpacity>
  ), [router]);

  const emptyComponent = useMemo(() => {
    if (isError) {
      return (
        <View className="items-center py-20">
          <Text className="text-skin-text-secondary text-base mb-3">
            불러오기에 실패했어요
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-skin-primary text-sm font-medium">
              다시 시도
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    const { title, subtitle: sub } = EMPTY_MESSAGES[activeTab];
    return (
      <View className="items-center py-20">
        <Text className="text-skin-text-secondary text-base">{title}</Text>
        <Text className="text-skin-text-secondary text-sm mt-1">{sub}</Text>
      </View>
    );
  }, [isError, activeTab, refetch]);

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["top"]}>
      <View className="px-5 pt-4 mb-2 flex-row items-center justify-end gap-4">
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          hitSlop={8}
        >
          <View>
            <Ionicons name="notifications-outline" size={28} color={Colors.skinPrimary} />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          hitSlop={8}
        >
          <Ionicons name="menu-outline" size={28} color={Colors.skinPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.skinPrimary} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListHeaderComponent={renderProfileHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.skinPrimary}
            />
          }
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </SafeAreaView>
  );
}
