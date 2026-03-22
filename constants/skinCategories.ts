export const SKIN_CATEGORIES = [
  "여드름",
  "홍조",
  "블랙헤드",
  "모공",
  "색소침착",
  "흉터",
  "주름",
] as const;

export const ALL_CATEGORIES = ["전체", ...SKIN_CATEGORIES] as const;

export type SkinCategory = (typeof SKIN_CATEGORIES)[number];
