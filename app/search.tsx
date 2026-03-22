import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type Question } from "@/services/questionApi";
import { useSearchQuestions } from "@/hooks/useSearchQuestions";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { timeAgo } from "@/utils/dateUtils";
import { Colors } from "@/constants/colors";

const PERIOD_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "1일", value: "1d" },
  { label: "1주", value: "1w" },
  { label: "1개월", value: "1m" },
  { label: "6개월", value: "6m" },
] as const;

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();
  const {
    data,
    isLoading,
    isRefetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useSearchQuestions(submittedQuery, period);

  const questions = useMemo(
    () => data?.pages.flatMap((p) => p.questions) ?? [],
    [data]
  );

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    setSubmittedQuery(trimmed);
  }, [inputValue, addSearch]);

  const handleClear = useCallback(() => {
    setInputValue("");
    setSubmittedQuery("");
    setPeriod("all");
    setShowPeriodPicker(false);
    inputRef.current?.focus();
  }, []);

  const handleChipPress = useCallback(
    (term: string) => {
      setInputValue(term);
      addSearch(term);
      setSubmittedQuery(term);
    },
    [addSearch]
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
          {(item._count?.answers ?? 0) > 0 && (
            <>
              <Ionicons name="chatbubble-outline" size={14} color={Colors.skinTextSecondary} />
              <Text className="text-xs text-skin-primary ml-1 mr-2 font-medium">
                {item._count?.answers}
              </Text>
            </>
          )}
          <Text className="text-xs text-skin-text-secondary">
            {timeAgo(item.createdAt)}
          </Text>
          <Text className="text-xs text-skin-text-secondary ml-2">
            {item.user?.nickname ?? "익명"}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [router]
  );

  const selectedPeriodLabel = useMemo(
    () => PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "전체",
    [period]
  );

  return (
    <SafeAreaView className="flex-1 bg-skin-bg">
      {/* Search Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color={Colors.skinText} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-skin-surface rounded-xl px-3 py-2.5 border border-skin-border">
          <Ionicons name="search" size={18} color={Colors.skinTextSecondary} />
          <TextInput
            ref={inputRef}
            className="flex-1 text-skin-text text-base ml-2"
            placeholder="글 제목, 내용"
            placeholderTextColor={Colors.skinTextSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            textContentType="none"
            importantForAutofill="no"
            keyboardAppearance="dark"
          />
          {inputValue.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={Colors.skinTextSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!submittedQuery ? (
        <View className="px-5 pt-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-skin-text">최근 검색어</Text>
            {searches.length > 0 && (
              <TouchableOpacity onPress={clearAll}>
                <Text className="text-sm text-skin-text-secondary">전체삭제</Text>
              </TouchableOpacity>
            )}
          </View>
          {searches.length === 0 ? (
            <Text className="text-sm text-skin-text-secondary mt-4">최근 검색어가 없어요</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {searches.map((term) => (
                <View
                  key={term}
                  className="flex-row items-center bg-skin-surface border border-skin-border rounded-full"
                >
                  <TouchableOpacity
                    className="pl-3 py-2"
                    onPress={() => handleChipPress(term)}
                  >
                    <Text className="text-sm text-skin-text">{term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-2 py-2"
                    onPress={() => removeSearch(term)}
                    hitSlop={4}
                  >
                    <Ionicons name="close" size={14} color={Colors.skinTextSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Filter Bar */}
          <View className="flex-row items-center px-5 py-2 border-b border-skin-border">
            <View className="flex-row items-center">
              <Text className="text-sm text-skin-text font-medium">최신순</Text>
              <Ionicons name="swap-vertical" size={16} color={Colors.skinText} style={{ marginLeft: 4 }} />
            </View>
            <TouchableOpacity
              className="flex-row items-center ml-4 bg-skin-surface border border-skin-border rounded-full px-3 py-1.5"
              onPress={() => setShowPeriodPicker(!showPeriodPicker)}
            >
              <Text className="text-sm text-skin-text">{selectedPeriodLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.skinText} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {showPeriodPicker && (
            <View className="flex-row flex-wrap gap-2 px-5 py-3 border-b border-skin-border">
              {PERIOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`rounded-full px-4 py-2 ${
                    period === opt.value
                      ? "bg-skin-primary"
                      : "bg-skin-surface border border-skin-border"
                  }`}
                  onPress={() => {
                    setPeriod(opt.value);
                    setShowPeriodPicker(false);
                  }}
                >
                  <Text
                    className={`text-sm ${
                      period === opt.value ? "text-white font-medium" : "text-skin-text"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.skinPrimary} />
            </View>
          ) : (
            <FlatList
              data={questions}
              renderItem={renderQuestion}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
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
                      검색에 실패했어요
                    </Text>
                    <TouchableOpacity onPress={() => refetch()}>
                      <Text className="text-skin-primary text-sm font-medium">다시 시도</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center py-20">
                    <Text className="text-skin-text-secondary text-base">
                      검색 결과가 없어요
                    </Text>
                  </View>
                )
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
