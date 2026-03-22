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

  const isFormValid = category && title.trim() && content.trim();

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
    if (!isFormValid) {
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
            style={{ flex: 1 }}
          >
            {/* Header: X / 질문하기 / 완료 */}
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
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isFormValid ? Colors.skinPrimary : Colors.skinInactive,
                  }}
                >
                  {createQuestion.isPending ? "등록 중..." : "완료"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1, paddingHorizontal: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Category selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 24 }}>
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
              <TextInput
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: Colors.skinText,
                  paddingVertical: 12,
                }}
                placeholder="제목을 입력해주세요."
                placeholderTextColor={Colors.skinTextSecondary}
                value={title}
                onChangeText={setTitle}
                keyboardAppearance="dark"
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
                multiline
                textAlignVertical="top"
              />

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
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
