import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateProfile } from "@/hooks/useUser";
import { useSkincareProducts } from "@/hooks/useSkincareProducts";
import { SKINCARE_CATEGORIES } from "@/constants/skincareCategories";
import SkincareProductSection from "@/components/SkincareProductSection";

export default function SkincareOnboardingScreen() {
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const updateProfile = useUpdateProfile();
  const { products, addProduct, removeProduct } = useSkincareProducts();

  const hasAny = useMemo(
    () => Object.values(products).some((arr) => arr.length > 0),
    [products]
  );

  const handleComplete = () => {
    const formData = new FormData();
    formData.append("skincareProducts", JSON.stringify(products));

    updateProfile.mutate(formData, {
      onSuccess: () => setOnboarded(),
    });
  };

  return (
    <View className="flex-1 bg-skin-bg px-6 pt-16">
      <View className="mb-10 mt-8">
        <Text className="text-3xl font-bold text-white">
          사용 중인 제품을{"\n"}알려주세요
        </Text>
        <Text className="text-white/50 mt-2">
          나중에 프로필에서 수정할 수 있어요
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {SKINCARE_CATEGORIES.map((cat) => (
          <SkincareProductSection
            key={cat.key}
            label={cat.label}
            products={products[cat.key] ?? []}
            onAdd={(name) => addProduct(cat.key, name)}
            onRemove={(index) => removeProduct(cat.key, index)}
          />
        ))}
      </ScrollView>

      <View className="pb-12 pt-4 gap-3">
        <TouchableOpacity
          className={`rounded-full py-4 items-center ${
            hasAny ? "bg-skin-primary" : "bg-skin-surface"
          }`}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={!hasAny || updateProfile.isPending}
        >
          <Text
            className={`text-lg font-semibold ${
              hasAny ? "text-white" : "text-white/30"
            }`}
          >
            {updateProfile.isPending ? "저장 중..." : "시작하기"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center py-2"
          onPress={setOnboarded}
          activeOpacity={0.7}
        >
          <Text className="text-base text-white/40">건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
