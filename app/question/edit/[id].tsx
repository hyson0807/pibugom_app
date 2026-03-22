import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
  Image,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuestion, useUpdateQuestion } from "@/hooks/useQuestions";
import { showToast } from "@/utils/toast";
import { SKIN_CATEGORIES } from "@/constants/skinCategories";
import { Colors } from "@/constants/colors";
import {
  pickQuestionImages,
  type CompressedImage,
} from "@/utils/imageUpload";
import type { QuestionImage } from "@/services/questionApi";

const MAX_IMAGES = 5;

export default function EditQuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: question, isLoading: isLoadingQuestion } = useQuestion(id);
  const updateQuestion = useUpdateQuestion();

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState<QuestionImage[]>([]);
  const [newImages, setNewImages] = useState<CompressedImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);
  const hasHydrated = useRef(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (question && !hasHydrated.current) {
      setCategory(question.category);
      setTitle(question.title);
      setContent(question.content);
      setExistingImages(question.images ?? []);
      hasHydrated.current = true;
    }
  }, [question]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const duration = Platform.OS === "ios" ? 250 : 0;

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const totalImageCount = existingImages.length + newImages.length;

  const handlePickImages = async () => {
    const remaining = MAX_IMAGES - totalImageCount;
    if (remaining <= 0) {
      showToast("info", `이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }
    const picked = await pickQuestionImages(remaining);
    setNewImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES - existingImages.length));
  };

  const handleRemoveExisting = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeleteImageIds((prev) => [...prev, imageId]);
  };

  const handleRemoveNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!category || !title.trim() || !content.trim()) {
      showToast("info", "카테고리, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    updateQuestion.mutate(
      {
        id,
        data: {
          title: title.trim(),
          content: content.trim(),
          category,
          newImages: newImages.length > 0 ? newImages : undefined,
          deleteImageIds: deleteImageIds.length > 0 ? deleteImageIds : undefined,
        },
      },
      {
        onSuccess: () => {
          showToast("success", "질문이 수정되었습니다!");
          router.back();
        },
        onError: () => {
          showToast("error", "수정에 실패했습니다.");
        },
      }
    );
  };

  if (isLoadingQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-skin-bg">
        <ActivityIndicator size="large" color={Colors.skinPrimary} />
      </View>
    );
  }

  const isFormValid = category && title.trim() && content.trim();

  return (
    <View className="flex-1 bg-skin-bg">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category selector */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          카테고리
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {SKIN_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: isSelected
                      ? Colors.skinPrimary
                      : Colors.skinSurface,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: Colors.skinBorder,
                  }}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isSelected ? "#FFFFFF" : Colors.skinText,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Title */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          제목
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.skinSurface,
            borderWidth: 1,
            borderColor: Colors.skinBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: Colors.skinText,
            marginBottom: 16,
          }}
          placeholder="어떤 고민이 있나요?"
          placeholderTextColor={Colors.skinPlaceholder}
          value={title}
          onChangeText={setTitle}
          keyboardAppearance="dark"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Content */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: Colors.skinTextSecondary,
            marginBottom: 8,
          }}
        >
          내용
        </Text>
        <TextInput
          style={{
            backgroundColor: Colors.skinSurface,
            borderWidth: 1,
            borderColor: Colors.skinBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: Colors.skinText,
            marginBottom: 16,
            minHeight: 120,
          }}
          placeholder="피부 고민을 자세히 적어주세요..."
          placeholderTextColor={Colors.skinPlaceholder}
          value={content}
          keyboardAppearance="dark"
          onChangeText={setContent}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Image Previews */}
        {(existingImages.length > 0 || newImages.length > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: "row", gap: 8, paddingTop: 8, paddingRight: 8 }}>
              {existingImages.map((img) => (
                <View key={img.id} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: img.imageUrl }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: Colors.skinSurface,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveExisting(img.id)}
                    hitSlop={4}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: Colors.skinBg,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.skinTextSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {newImages.map((img, idx) => (
                <View key={`new-${idx}`} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: Colors.skinSurface,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveNew(idx)}
                    hitSlop={4}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: Colors.skinBg,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.skinTextSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={{
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 40,
            backgroundColor: isFormValid
              ? Colors.skinPrimary
              : Colors.skinInactive,
          }}
          onPress={handleSubmit}
          disabled={!isFormValid || updateQuestion.isPending}
          activeOpacity={0.8}
        >
          <Text
            style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}
          >
            {updateQuestion.isPending ? "수정 중..." : "수정 완료"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Toolbar */}
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: Animated.add(34, keyboardHeight),
          borderTopWidth: 0.5,
          borderTopColor: Colors.skinBorder,
          backgroundColor: Colors.skinBg,
        }}
      >
        <TouchableOpacity
          onPress={handlePickImages}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Ionicons
            name="camera-outline"
            size={24}
            color={Colors.skinTextSecondary}
          />
        </TouchableOpacity>
        {totalImageCount > 0 && (
          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
              color: Colors.skinTextSecondary,
            }}
          >
            {totalImageCount}/{MAX_IMAGES}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
