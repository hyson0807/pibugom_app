import { useMemo } from "react";
import ActionSheet, { type ActionSheetItem } from "./ActionSheet";
import { Colors } from "@/constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}

export default function BlockActionSheet({
  visible,
  onClose,
  onReport,
  onBlock,
}: Props) {
  const actions = useMemo<ActionSheetItem[]>(
    () => [
      {
        icon: "flag-outline",
        label: "신고하기",
        color: Colors.skinAccent,
        onPress: onReport,
      },
      {
        icon: "ban-outline",
        label: "이 사용자 차단하기",
        color: Colors.skinError,
        onPress: onBlock,
      },
    ],
    [onReport, onBlock]
  );

  return <ActionSheet visible={visible} onClose={onClose} actions={actions} />;
}
