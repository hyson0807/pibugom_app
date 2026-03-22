import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import ActionSheet, { type ActionSheetItem } from "./ActionSheet";
import { Colors } from "@/constants/colors";

const REASONS = [
  { key: "spam", label: "스팸" },
  { key: "inappropriate", label: "부적절한 콘텐츠" },
  { key: "hate_speech", label: "혐오 발언" },
  { key: "privacy", label: "개인정보 노출" },
  { key: "other", label: "기타" },
] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail?: string) => void;
}

export default function ReportReasonSheet({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailText, setDetailText] = useState("");

  const actions = useMemo<ActionSheetItem[]>(
    () =>
      REASONS.map((r) => ({
        icon: "alert-circle-outline" as const,
        label: r.label,
        onPress: () => {
          if (r.key === "other") {
            setDetailVisible(true);
          } else {
            onSubmit(r.key);
          }
        },
      })),
    [onSubmit]
  );

  const handleDetailSubmit = () => {
    const trimmed = detailText.trim();
    if (!trimmed) return;
    setDetailVisible(false);
    setDetailText("");
    onSubmit("other", trimmed);
  };

  const handleDetailClose = () => {
    setDetailVisible(false);
    setDetailText("");
  };

  const handleClose = () => {
    setDetailText("");
    setDetailVisible(false);
    onClose();
  };

  return (
    <>
      <ActionSheet
        visible={visible}
        onClose={handleClose}
        actions={actions}
      />

      <Modal
        visible={detailVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDetailClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          onPress={handleDetailClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: Colors.skinSurface,
              borderRadius: 16,
              padding: 20,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: Colors.skinText,
                marginBottom: 12,
              }}
            >
              신고 사유를 입력해주세요
            </Text>
            <TextInput
              style={{
                backgroundColor: Colors.skinBg,
                borderRadius: 12,
                padding: 12,
                color: Colors.skinText,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: Colors.skinBorder,
              }}
              placeholder="상세 내용을 입력하세요..."
              placeholderTextColor={Colors.skinPlaceholder}
              value={detailText}
              onChangeText={setDetailText}
              multiline
              maxLength={500}
              keyboardAppearance="dark"
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={handleDetailClose}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: Colors.skinTextSecondary, fontSize: 14 }}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDetailSubmit}
                disabled={!detailText.trim()}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: detailText.trim()
                    ? Colors.skinPrimary
                    : Colors.skinInactive,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
                  신고하기
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
