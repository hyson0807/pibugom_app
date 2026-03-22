import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useRef, useCallback } from "react";
import { useOnboardingStore } from "../../stores/useOnboardingStore";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i);

const MONTH_NAMES = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

function WheelPicker({
  data,
  labels,
  selectedIndex,
  onSelect,
}: {
  data: number[];
  labels?: string[];
  selectedIndex: number;
  onSelect: (value: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      if (index >= 0 && index < data.length) {
        onSelect(data[index]);
      }
    },
    [data, onSelect]
  );

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} className="flex-1">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * paddingItems,
        }}
        contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
        onMomentumScrollEnd={handleScroll}
      >
        {data.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View
              key={item}
              style={{ height: ITEM_HEIGHT }}
              className="items-center justify-center"
            >
              <Text
                className={`text-xl ${
                  isSelected
                    ? "text-white font-bold text-2xl"
                    : "text-white/30 font-medium"
                }`}
              >
                {labels ? labels[index] : item}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Selection indicator */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 rounded-lg bg-white/10"
        style={{
          top: ITEM_HEIGHT * paddingItems,
          height: ITEM_HEIGHT,
        }}
      />
    </View>
  );
}

export default function AgeScreen() {
  const router = useRouter();
  const { birthMonth, birthYear, setBirth } = useOnboardingStore();

  const monthIndex = birthMonth - 1;
  const yearIndex = YEARS.indexOf(birthYear);
  const age = currentYear - birthYear;

  return (
    <View className="flex-1 bg-skin-bg px-6 pt-16">
      {/* Header */}
      <View className="mb-12">
        <Text className="text-3xl font-bold text-white">
          생년월을 알려주세요
        </Text>
        <Text className="text-white/50 mt-2">
          맞춤 피부 관리를 위해 필요해요
        </Text>
      </View>

      {/* Picker */}
      <View className="flex-row mx-4 mb-8" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
        <WheelPicker
          data={MONTHS}
          labels={MONTH_NAMES}
          selectedIndex={monthIndex}
          onSelect={(m) => setBirth(m, birthYear)}
        />
        <View className="w-4" />
        <WheelPicker
          data={YEARS}
          selectedIndex={yearIndex}
          onSelect={(y) => setBirth(birthMonth, y)}
        />
      </View>

      {/* Age display */}
      <Text className="text-center text-white text-xl font-semibold mb-8">
        {age}세
      </Text>

      {/* Bottom */}
      <View className="flex-1" />
      <TouchableOpacity
        className="bg-skin-primary rounded-full py-4 items-center mb-12"
        onPress={() => router.push("/(onboarding)/gender")}
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-semibold">다음</Text>
      </TouchableOpacity>
    </View>
  );
}
