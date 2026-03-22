import { create } from "zustand";

interface OnboardingState {
  birthMonth: number;
  birthYear: number;
  gender: string;
  skinConcerns: string[];

  setBirth: (month: number, year: number) => void;
  setGender: (gender: string) => void;
  toggleConcern: (concern: string) => void;
  reset: () => void;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  birthMonth: currentMonth,
  birthYear: currentYear - 20,
  gender: "",
  skinConcerns: [],

  setBirth: (month, year) => set({ birthMonth: month, birthYear: year }),

  setGender: (gender) => set({ gender }),

  toggleConcern: (concern) => {
    const current = get().skinConcerns;
    if (current.includes(concern)) {
      set({ skinConcerns: current.filter((c) => c !== concern) });
    } else {
      set({ skinConcerns: [...current, concern] });
    }
  },

  reset: () =>
    set({
      birthMonth: currentMonth,
      birthYear: currentYear - 20,
      gender: "",
      skinConcerns: [],
    }),
}));
