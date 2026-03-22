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

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [newImage, setNewImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const displayImage = newImage?.uri ?? user?.profileImage;

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

    if (!nicknameChanged && !imageChanged) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (nicknameChanged && trimmed) {
        formData.append("nickname", trimmed);
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

  return (
    <SafeAreaView className="flex-1 bg-skin-bg" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
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
