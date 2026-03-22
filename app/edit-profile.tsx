import { useState, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../stores/useAuthStore";
import { useUpdateProfile } from "../hooks/useUser";
import { showToast } from "../utils/toast";
import { Colors } from "../constants/colors";
import { SKIN_CATEGORIES } from "../constants/skinCategories";
import WheelPicker, { ITEM_HEIGHT, VISIBLE_ITEMS } from "../components/WheelPicker";
import { pickAndCompressImage } from "../utils/imageUpload";

const GENDERS = [
  { value: "MALE", label: "남성", icon: "male" as const },
  { value: "FEMALE", label: "여성", icon: "female" as const },
  { value: "OTHER", label: "기타", icon: "person" as const },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1949 }, (_, i) => 1950 + i);
const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [birthMonth, setBirthMonth] = useState(user?.birthMonth ?? 1);
  const [birthYear, setBirthYear] = useState(user?.birthYear ?? 2000);
  const [skinConcerns, setSkinConcerns] = useState<string[]>(
    user?.skinConcerns ?? []
  );
  const [newImage, setNewImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  const displayImage = newImage?.uri ?? user?.profileImage;

  const toggleConcern = (concern: string) => {
    setSkinConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const handlePickImage = async () => {
    const image = await pickAndCompressImage();
    if (image) {
      setNewImage(image);
    }
  };

  const handleSave = useCallback(() => {
    if (skinConcerns.length === 0) {
      showToast("info", "피부 고민을 최소 1개 이상 선택해주세요.");
      return;
    }

    const trimmed = nickname.trim();
    const formData = new FormData();
    if (trimmed) formData.append("nickname", trimmed);
    if (gender) formData.append("gender", gender);
    formData.append("birthMonth", String(birthMonth));
    formData.append("birthYear", String(birthYear));
    formData.append("skinConcerns", JSON.stringify(skinConcerns));
    if (newImage) {
      formData.append("profileImage", {
        uri: newImage.uri,
        type: newImage.type,
        name: newImage.name,
      } as unknown as Blob);
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        router.back();
      },
      onError: () => {
        showToast("error", "프로필 수정에 실패했어요. 다시 시도해주세요.");
      },
    });
  }, [nickname, gender, birthMonth, birthYear, skinConcerns, newImage, updateProfile, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text className="text-sm font-medium text-skin-primary">취소</Text>
        </TouchableOpacity>
      ),
      headerTitleStyle: { fontSize: 14, fontWeight: "600" },
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={updateProfile.isPending} hitSlop={8}>
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color={Colors.skinPrimary} />
          ) : (
            <Text className="text-sm font-medium text-skin-primary">저장</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave, updateProfile.isPending, router]);

  const monthIndex = birthMonth - 1;
  const yearIndex = YEARS.indexOf(birthYear);

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile image */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
              <View>
                {displayImage ? (
                  <Image
                    source={{ uri: displayImage }}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <View className="w-24 h-24 rounded-full bg-skin-surface items-center justify-center border border-skin-border">
                    <Ionicons
                      name="person"
                      size={44}
                      color={Colors.skinTextSecondary}
                    />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-skin-primary items-center justify-center">
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-skin-text-secondary mt-3">
              사진을 탭하여 변경
            </Text>
          </View>

          {/* Nickname input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-skin-text mb-2">
              닉네임
            </Text>
            <TextInput
              className="bg-skin-surface border border-skin-border rounded-xl px-4 py-3 text-skin-text text-base"
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={Colors.skinPlaceholder}
              maxLength={20}
              autoCapitalize="none"
              keyboardAppearance="dark"
            />
            <Text className="text-xs text-skin-text-secondary mt-1 text-right">
              {nickname.length}/20
            </Text>
          </View>

          {/* Skin concerns */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-skin-text mb-2">
              피부 고민
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SKIN_CATEGORIES.map((concern) => {
                const isSelected = skinConcerns.includes(concern);
                return (
                  <TouchableOpacity
                    key={concern}
                    className={`rounded-full px-4 py-2 ${
                      isSelected
                        ? "bg-skin-primary"
                        : "bg-skin-surface border border-skin-border"
                    }`}
                    onPress={() => toggleConcern(concern)}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-skin-text-secondary"
                      }`}
                    >
                      {concern}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Gender selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-skin-text mb-2">
              성별
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {GENDERS.map((g) => {
                const isSelected = gender === g.value;
                return (
                  <TouchableOpacity
                    key={g.value}
                    className={`rounded-full px-4 py-2 flex-row items-center ${
                      isSelected
                        ? "bg-skin-primary"
                        : "bg-skin-surface border border-skin-border"
                    }`}
                    onPress={() => setGender(g.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={g.icon}
                      size={18}
                      color={isSelected ? "white" : Colors.skinTextSecondary}
                    />
                    <Text
                      className={`text-sm font-medium ml-1.5 ${
                        isSelected ? "text-white" : "text-skin-text-secondary"
                      }`}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Birth year/month picker */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-skin-text mb-2">
              생년월
            </Text>
            <View
              className="flex-row mx-2"
              style={{ height: ITEM_HEIGHT * 3 }}
            >
              <WheelPicker
                data={MONTHS}
                labels={MONTH_NAMES}
                selectedIndex={monthIndex}
                onSelect={(m) => setBirthMonth(m)}
                visibleItems={3}
              />
              <View className="w-4" />
              <WheelPicker
                data={YEARS}
                selectedIndex={yearIndex}
                onSelect={(y) => setBirthYear(y)}
                visibleItems={3}
              />
            </View>
          </View>



        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
