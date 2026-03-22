import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCreateQuestion } from "../hooks/useQuestions";
import { showToast } from "../utils/toast";
import { SKIN_CATEGORIES } from "../constants/skinCategories";
import { Colors } from "../constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QuestionBottomSheet({ visible, onClose }: Props) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createQuestion = useCreateQuestion();

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setContent("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!category || !title.trim() || !content.trim()) {
      showToast("info", "카테고리, 제목, 내용을 모두 입력해주세요.");
      return;
    }

    createQuestion.mutate(
      { title: title.trim(), content: content.trim(), category },
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.skinBorder,
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: Colors.skinText }}>
                피부 고민 질문하기
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={Colors.skinTextSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
              {/* Category selector */}
              <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.skinTextSecondary, marginBottom: 8 }}>
                카테고리
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
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
                          backgroundColor: isSelected ? Colors.skinPrimary : Colors.skinSurface,
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
              <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.skinTextSecondary, marginBottom: 8 }}>
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
              />

              {/* Content */}
              <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.skinTextSecondary, marginBottom: 8 }}>
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
                  marginBottom: 24,
                  minHeight: 120,
                }}
                placeholder="피부 고민을 자세히 적어주세요..."
                placeholderTextColor={Colors.skinPlaceholder}
                value={content}
                onChangeText={setContent}
                keyboardAppearance="dark"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity
                style={{
                  borderRadius: 24,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 40,
                  backgroundColor:
                    category && title.trim() && content.trim()
                      ? Colors.skinPrimary
                      : Colors.skinInactive,
                }}
                onPress={handleSubmit}
                disabled={!category || !title.trim() || !content.trim() || createQuestion.isPending}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}>
                  {createQuestion.isPending ? "등록 중..." : "질문 올리기"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
