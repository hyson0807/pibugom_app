import { useMemo } from "react";
import ActionSheet, { type ActionSheetItem } from "./ActionSheet";
import { Colors } from "@/constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onBlock: () => void;
}

export default function BlockActionSheet({
  visible,
  onClose,
  onBlock,
}: Props) {
  const actions = useMemo<ActionSheetItem[]>(
    () => [
      {
        icon: "ban-outline",
        label: "이 사용자 차단하기",
        color: Colors.skinError,
        onPress: onBlock,
      },
    ],
    [onBlock]
  );

  return <ActionSheet visible={visible} onClose={onClose} actions={actions} />;
}
