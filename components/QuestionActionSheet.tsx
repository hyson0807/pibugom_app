import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionActionSheet({
  visible,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: Colors.skinBg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: Colors.skinBorder,
              }}
            />
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
            onPress={() => {
              onClose();
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={22} color={Colors.skinText} />
            <Text
              style={{
                fontSize: 16,
                color: Colors.skinText,
                marginLeft: 12,
              }}
            >
              수정하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
            onPress={() => {
              onClose();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={22} color={Colors.skinError} />
            <Text
              style={{
                fontSize: 16,
                color: Colors.skinError,
                marginLeft: 12,
              }}
            >
              삭제하기
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
