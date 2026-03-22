import { useMemo } from "react";
import ActionSheet, { type ActionSheetItem } from "./ActionSheet";
import { Colors } from "@/constants/colors";

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
  const actions = useMemo<ActionSheetItem[]>(
    () => [
      { icon: "create-outline", label: "수정하기", onPress: onEdit },
      {
        icon: "trash-outline",
        label: "삭제하기",
        color: Colors.skinError,
        onPress: onDelete,
      },
    ],
    [onEdit, onDelete]
  );

  return <ActionSheet visible={visible} onClose={onClose} actions={actions} />;
}
