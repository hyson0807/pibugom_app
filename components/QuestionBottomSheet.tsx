import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Pressable,
  ActivityIndicator,
  Image,
  Keyboard,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCreateQuestion } from "@/hooks/useQuestions";
import { showToast } from "@/utils/toast";
import { SKIN_CATEGORIES } from "@/constants/skinCategories";
import { Colors } from "@/constants/colors";
import {
  pickQuestionImages,
  type CompressedImage,
} from "@/utils/imageUpload";

const MAX_IMAGES = 5;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QuestionBottomSheet({ visible, onClose }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<CompressedImage[]>([]);
  const createQuestion = useCreateQuestion();
  const keyboardHeight = useRef(new Animated.Value(0)).current;

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

  const isFormValid = title.trim() && content.trim();

  const resetForm = () => {
    setCategories([]);
    setTitle("");
    setContent("");
    setImages([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      showToast("info", `이미지는 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }
    const picked = await pickQuestionImages(remaining);
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      showToast("info", "제목과 내용을 모두 입력해주세요.");
      return;
    }

    createQuestion.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        categories,
        images: images.length > 0 ? images : undefined,
      },
      {
        onSuccess: () => {
          showToast("success", "질문이 등록되었습니다!");
          handleClose();
        },
        onError: () => {
          showToast("error", "질문 등록에 실패했습니다.");
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={handleClose}>
        <View style={{ height: 60 }} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            backgroundColor: Colors.skinBg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 12,
            }}
          >
            <TouchableOpacity onPress={handleClose} style={{ width: 60 }}>
              <Ionicons name="close" size={26} color={Colors.skinText} />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "600", color: Colors.skinText }}>
              질문하기
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || createQuestion.isPending}
              style={{ width: 60, alignItems: "flex-end" }}
            >
              {createQuestion.isPending ? (
                <ActivityIndicator size="small" color={Colors.skinPrimary} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isFormValid ? Colors.skinPrimary : Colors.skinInactive,
                  }}
                >
                  완료
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Category selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 24 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {SKIN_CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={{
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: isSelected ? Colors.skinPrimary : Colors.skinSurface,
                        borderWidth: 1,
                        borderColor: isSelected ? Colors.skinPrimary : Colors.skinBorder,
                      }}
                      onPress={() =>
                        setCategories((prev) =>
                          isSelected
                            ? prev.filter((c) => c !== cat)
                            : [...prev, cat]
                        )
                      }
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
            <TextInput
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: Colors.skinText,
                paddingVertical: 12,
                lineHeight: 30,
              }}
              placeholder="제목을 입력해주세요."
              placeholderTextColor={Colors.skinTextSecondary}
              value={title}
              onChangeText={setTitle}
              keyboardAppearance="dark"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
            <View
              style={{
                height: 0.5,
                backgroundColor: Colors.skinBorder,
                marginBottom: 16,
              }}
            />

            {/* Content */}
            <TextInput
              style={{
                fontSize: 15,
                color: Colors.skinText,
                minHeight: 150,
                paddingVertical: 4,
                lineHeight: 22,
              }}
              placeholder="피부 고민을 자세히 적어주세요..."
              placeholderTextColor={Colors.skinTextSecondary}
              value={content}
              onChangeText={setContent}
              keyboardAppearance="dark"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              multiline
              textAlignVertical="top"
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 16 }}
              >
                <View style={{ flexDirection: "row", gap: 8, paddingTop: 8, paddingRight: 8 }}>
                  {images.map((img, idx) => (
                    <View key={idx} style={{ position: "relative" }}>
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
                        onPress={() => handleRemoveImage(idx)}
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

            {/* Community Rules */}
            <View style={{ marginTop: 60, marginBottom: 40 }}>
              <Text style={{ fontSize: 13, color: Colors.skinTextSecondary, lineHeight: 20 }}>
                피부곰은 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다.
              </Text>

              <Text style={{ fontSize: 13, color: Colors.skinTextSecondary, lineHeight: 20, marginTop: 16 }}>
                아래는 이 게시판에 해당하는 핵심 내용에 대한 요약 사항이며, 게시물 작성 전 커뮤니티 이용규칙 전문을 반드시 확인하시기 바랍니다.
              </Text>

              <Text style={{ fontSize: 13, color: Colors.skinTextSecondary, lineHeight: 20, marginTop: 16 }}>
                {"※ 광고·홍보 관련 행위 금지\n- 영리 여부와 관계 없이 특정 제품, 병원, 시술을 홍보하는 게시물 작성 행위\n- 바이럴 홍보 및 체험단 후기로 의심되는 게시물 작성 행위"}
              </Text>

              <Text style={{ fontSize: 13, color: Colors.skinTextSecondary, lineHeight: 20, marginTop: 16 }}>
                {"※ 허위 정보 유포 금지\n- 검증되지 않은 의학 정보를 사실처럼 전달하는 행위\n- 특정 치료법이나 제품의 효과를 과장하거나 왜곡하는 행위"}
              </Text>
            </View>
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
            {images.length > 0 && (
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 13,
                  color: Colors.skinTextSecondary,
                }}
              >
                {images.length}/{MAX_IMAGES}
              </Text>
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
