import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type Question } from "@/services/questionApi";
import { useQuestions } from "@/hooks/useQuestions";
import { ALL_CATEGORIES } from "@/constants/skinCategories";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";

export default function HelpScreen() {
  const router = useRouter();
  const [category, setCategory] = useState("전체");

  const {
    data,
    isLoading,
    isRefetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useQuestions(category);

  const questions = useMemo(
    () => data?.pages.flatMap((p) => p.questions) ?? [],
    [data]
  );

  const renderQuestion = useCallback(
    ({ item }: { item: Question }) => (
      <TouchableOpacity
        className="bg-skin-surface rounded-2xl p-4 mb-3 border border-skin-border"
        onPress={() => router.push(`/question/${item.id}`)}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-skin-text mb-1" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-sm text-skin-text-secondary mb-2" numberOfLines={2}>
          {item.content}
        </Text>
        <View className="flex-row items-center">
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
    ),
    [router]
  );

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["top"]}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className="text-2xl text-skin-primary"
            style={{ fontFamily: "Pacifico_400Regular" }}
          >
            Pibugom
          </Text>
          <TouchableOpacity onPress={() => router.push("/search")} hitSlop={8}>
            <Ionicons name="search-outline" size={24} color={Colors.skinText} />
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {ALL_CATEGORIES.map((cat) => {
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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.skinPrimary}
            />
          }
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isError ? (
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
            ) : (
              <View className="items-center py-20">
                <Text className="text-skin-text-secondary text-base">
                  아직 질문이 없어요
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
