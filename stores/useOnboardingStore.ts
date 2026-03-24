import { create } from "zustand";

interface OnboardingState {
  birthMonth: number | null;
  birthYear: number | null;
  gender: string;
  skinConcerns: string[];

  setBirth: (month: number | null, year: number | null) => void;
  setGender: (gender: string) => void;
  toggleConcern: (concern: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  birthMonth: null,
  birthYear: null,
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
      birthMonth: null,
      birthYear: null,
      gender: "",
      skinConcerns: [],
    }),
}));
