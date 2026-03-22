import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "../../stores/useOnboardingStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { api } from "../../services/api";
import { SKIN_CATEGORIES } from "../../constants/skinCategories";

export default function SkinConcernsScreen() {
  const router = useRouter();
  const { birthMonth, birthYear, gender, skinConcerns, toggleConcern, reset } =
    useOnboardingStore();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (skinConcerns.length === 0) return;
    setIsSubmitting(true);

    try {
      await api.patch("/users/onboarding", {
        birthMonth,
        birthYear,
        gender,
        skinConcerns,
      });
      setOnboarded();
      reset();
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert("오류", "저장 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-skin-dark px-6 pt-16">
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-white">
          어떤 피부 고민이 있나요?
        </Text>
        <Text className="text-white/50 mt-2">여러 개를 선택할 수 있어요</Text>
      </View>

      {/* Concern chips */}
      <View className="flex-row flex-wrap gap-3">
        {SKIN_CATEGORIES.map((concern) => {
          const isSelected = skinConcerns.includes(concern);
          return (
            <TouchableOpacity
              key={concern}
              className={`rounded-full px-5 py-3 ${
                isSelected
                  ? "bg-skin-primary"
                  : "bg-skin-dark-surface border border-skin-dark-border"
              }`}
              onPress={() => toggleConcern(concern)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base font-medium ${
                  isSelected ? "text-white" : "text-white/60"
                }`}
              >
                {concern}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom */}
      <View className="flex-1" />
      <TouchableOpacity
        className={`rounded-full py-4 items-center mb-12 ${
          skinConcerns.length > 0 ? "bg-skin-primary" : "bg-skin-dark-surface"
        }`}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={skinConcerns.length === 0 || isSubmitting}
      >
        <Text
          className={`text-lg font-semibold ${
            skinConcerns.length > 0 ? "text-white" : "text-white/30"
          }`}
        >
          {isSubmitting ? "저장 중..." : "시작하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
