export const GENDERS = [
  { value: "MALE", label: "남성", icon: "male" as const },
  { value: "FEMALE", label: "여성", icon: "female" as const },
  { value: "OTHER", label: "기타", icon: "person" as const },
] as const;

export const GENDER_LABEL: Record<string, string> = Object.fromEntries(
  GENDERS.map((g) => [g.value, g.label]),
);
