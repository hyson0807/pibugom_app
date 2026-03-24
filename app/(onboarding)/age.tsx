import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import WheelPicker, { ITEM_HEIGHT, VISIBLE_ITEMS } from "@/components/WheelPicker";

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

export default function AgeScreen() {
  const router = useRouter();
  const setBirth = useOnboardingStore((s) => s.setBirth);

  const [localMonth, setLocalMonth] = useState(new Date().getMonth() + 1);
  const [localYear, setLocalYear] = useState(currentYear - 20);

  const monthIndex = localMonth - 1;
  const yearIndex = YEARS.indexOf(localYear);
  const age = currentYear - localYear;

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
          onSelect={(m) => setLocalMonth(m)}
        />
        <View className="w-4" />
        <WheelPicker
          data={YEARS}
          selectedIndex={yearIndex}
          onSelect={(y) => setLocalYear(y)}
        />
      </View>

      {/* Age display */}
      <Text className="text-center text-white text-xl font-semibold mb-8">
        {age}세
      </Text>

      {/* Bottom */}
      <View className="flex-1" />
      <TouchableOpacity
        className="bg-skin-primary rounded-full py-4 items-center"
        onPress={() => {
          setBirth(localMonth, localYear);
          router.push("/(onboarding)/gender");
        }}
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-semibold">다음</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="py-4 items-center mb-12"
        onPress={() => {
          setBirth(null, null);
          router.push("/(onboarding)/gender");
        }}
        activeOpacity={0.8}
      >
        <Text className="text-white/50 text-base">건너뛰기</Text>
      </TouchableOpacity>
    </View>
  );
}
