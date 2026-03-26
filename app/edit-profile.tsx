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
import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateProfile } from "@/hooks/useUser";
import { showToast } from "@/utils/toast";
import { Colors } from "@/constants/colors";
import { pickAndCompressImage } from "@/utils/imageUpload";

const GENDERS = [
  { value: "MALE", label: "남성", icon: "male" as const },
  { value: "FEMALE", label: "여성", icon: "female" as const },
  { value: "OTHER", label: "기타", icon: "person" as const },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [newImage, setNewImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  const displayImage = newImage?.uri ?? user?.profileImage;

  const handlePickImage = async () => {
    const image = await pickAndCompressImage();
    if (image) {
      setNewImage(image);
    }
  };

  const handleSave = useCallback(() => {
    const trimmed = nickname.trim();
    const formData = new FormData();
    if (trimmed) formData.append("nickname", trimmed);
    if (gender) formData.append("gender", gender);
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
  }, [nickname, gender, newImage, updateProfile, router]);

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

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
