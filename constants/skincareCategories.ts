export const SKINCARE_CATEGORIES = [
  { key: "cleanser", label: "세안제", icon: "water-outline" as const },
  { key: "moisturizer", label: "보습제", icon: "flask-outline" as const },
  { key: "sunscreen", label: "선크림", icon: "sunny-outline" as const },
] as const;

export type SkincareCategoryKey = (typeof SKINCARE_CATEGORIES)[number]["key"];
