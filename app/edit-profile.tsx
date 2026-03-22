import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../stores/useAuthStore";
import { userApi } from "../services/userApi";
import { Colors } from "../constants/colors";
import { SKIN_CATEGORIES } from "../constants/skinCategories";
import WheelPicker, { ITEM_HEIGHT, VISIBLE_ITEMS } from "../components/WheelPicker";

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
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

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
  const [isSaving, setIsSaving] = useState(false);

  const displayImage = newImage?.uri ?? user?.profileImage;

  const toggleConcern = (concern: string) => {
    setSkinConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const handlePickImage = async () => {
    const { pickAndCompressImage } = await import("../utils/imageUpload");
    const image = await pickAndCompressImage();
    if (image) {
      setNewImage(image);
    }
  };

  const handleSave = async () => {
    const trimmed = nickname.trim();
    const nicknameChanged = trimmed !== (user?.nickname ?? "");
    const imageChanged = !!newImage;
    const genderChanged = gender !== (user?.gender ?? "");
    const birthMonthChanged = birthMonth !== (user?.birthMonth ?? 1);
    const birthYearChanged = birthYear !== (user?.birthYear ?? 2000);
    const skinConcernsChanged =
      JSON.stringify(skinConcerns) !== JSON.stringify(user?.skinConcerns ?? []);

    const hasChanges =
      nicknameChanged ||
      imageChanged ||
      genderChanged ||
      birthMonthChanged ||
      birthYearChanged ||
      skinConcernsChanged;

    if (!hasChanges) {
      router.back();
      return;
    }

    if (skinConcerns.length === 0) {
      Alert.alert("알림", "피부 고민을 최소 1개 이상 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (nicknameChanged && trimmed) {
        formData.append("nickname", trimmed);
      }
      if (genderChanged && gender) {
        formData.append("gender", gender);
      }
      if (birthMonthChanged) {
        formData.append("birthMonth", String(birthMonth));
      }
      if (birthYearChanged) {
        formData.append("birthYear", String(birthYear));
      }
      if (skinConcernsChanged) {
        formData.append("skinConcerns", JSON.stringify(skinConcerns));
      }
      if (newImage) {
        formData.append("profileImage", {
          uri: newImage.uri,
          type: newImage.type,
          name: newImage.name,
        } as unknown as Blob);
      }
      const updated = await userApi.updateProfile(formData);
      setUser(updated);
      router.back();
    } catch {
      Alert.alert("오류", "프로필 수정에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const monthIndex = birthMonth - 1;
  const yearIndex = YEARS.indexOf(birthYear);
  const age = currentYear - birthYear;

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
            />
            <Text className="text-xs text-skin-text-secondary mt-1 text-right">
              {nickname.length}/20
            </Text>
          </View>

          {/* Gender selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-skin-text mb-2">
              성별
            </Text>
            <View className="flex-row gap-3">
              {GENDERS.map((g) => {
                const isSelected = gender === g.value;
                return (
                  <TouchableOpacity
                    key={g.value}
                    className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
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
              style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
            >
              <WheelPicker
                data={MONTHS}
                labels={MONTH_NAMES}
                selectedIndex={monthIndex}
                onSelect={(m) => setBirthMonth(m)}
              />
              <View className="w-4" />
              <WheelPicker
                data={YEARS}
                selectedIndex={yearIndex}
                onSelect={(y) => setBirthYear(y)}
              />
            </View>
            <Text className="text-center text-skin-text text-base font-semibold mt-2">
              {age}세
            </Text>
          </View>

          {/* Skin concerns */}
          <View className="mb-8">
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

          {/* Save button */}
          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center ${
              isSaving ? "bg-skin-primary/50" : "bg-skin-primary"
            }`}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-semibold text-white">저장</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
