import { useMemo } from "react";
import ActionSheet, { type ActionSheetItem } from "./ActionSheet";
import { Colors } from "@/constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function AnswerActionSheet({
  visible,
  onClose,
  onDelete,
}: Props) {
  const actions = useMemo<ActionSheetItem[]>(
    () => [
      {
        icon: "trash-outline",
        label: "삭제하기",
        color: Colors.skinError,
        onPress: onDelete,
      },
    ],
    [onDelete]
  );

  return <ActionSheet visible={visible} onClose={onClose} actions={actions} />;
}
