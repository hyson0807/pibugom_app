import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/stores/useOnboardingStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/services/api";
import { Colors } from "@/constants/colors";
import { showToast } from "@/utils/toast";

const GENDERS = [
  { value: "MALE", label: "남성", icon: "male" as const },
  { value: "FEMALE", label: "여성", icon: "female" as const },
  { value: "OTHER", label: "기타", icon: "person" as const },
];

export default function GenderScreen() {
  const { gender, setGender, reset } = useOnboardingStore();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gender) return;
    setIsSubmitting(true);

    try {
      await api.patch("/users/onboarding", { gender });
      setOnboarded();
      reset();
    } catch {
      showToast("error", "저장 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-skin-bg px-6 pt-16">
      {/* Header */}
      <View className="mb-12 mt-8">
        <Text className="text-3xl font-bold text-white">
          성별을 알려주세요
        </Text>
        <Text className="text-white/50 mt-2">
          맞춤 피부 관리를 위해 필요해요
        </Text>
      </View>

      {/* Gender cards */}
      <View className="gap-4">
        {GENDERS.map((g) => {
          const isSelected = gender === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              className={`rounded-2xl p-5 flex-row items-center ${
                isSelected
                  ? "bg-skin-primary"
                  : "bg-skin-surface border border-skin-border"
              }`}
              onPress={() => setGender(g.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={g.icon}
                size={28}
                color={isSelected ? "white" : Colors.skinTextSecondary}
              />
              <Text
                className={`text-xl font-semibold ml-4 ${
                  isSelected ? "text-white" : "text-white/60"
                }`}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom */}
      <View className="flex-1" />
      <TouchableOpacity
        className={`rounded-full py-4 items-center mb-12 ${
          gender ? "bg-skin-primary" : "bg-skin-surface"
        }`}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={!gender || isSubmitting}
      >
        <Text
          className={`text-lg font-semibold ${
            gender ? "text-white" : "text-white/30"
          }`}
        >
          {isSubmitting ? "저장 중..." : "시작하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
