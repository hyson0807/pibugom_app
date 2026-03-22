import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "../../stores/useOnboardingStore";

const GENDERS = [
  { value: "MALE", label: "남성", icon: "male" as const },
  { value: "FEMALE", label: "여성", icon: "female" as const },
  { value: "OTHER", label: "기타", icon: "person" as const },
];

export default function GenderScreen() {
  const router = useRouter();
  const { gender, setGender } = useOnboardingStore();

  return (
    <View className="flex-1 bg-skin-dark px-6 pt-16">
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Header */}
      <View className="mb-12">
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
                  : "bg-skin-dark-surface border border-skin-dark-border"
              }`}
              onPress={() => setGender(g.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={g.icon}
                size={28}
                color={isSelected ? "white" : "#8A8A8A"}
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
          gender ? "bg-skin-primary" : "bg-skin-dark-surface"
        }`}
        onPress={() => gender && router.push("/(onboarding)/skin-concerns")}
        activeOpacity={0.8}
        disabled={!gender}
      >
        <Text
          className={`text-lg font-semibold ${
            gender ? "text-white" : "text-white/30"
          }`}
        >
          다음
        </Text>
      </TouchableOpacity>
    </View>
  );
}
