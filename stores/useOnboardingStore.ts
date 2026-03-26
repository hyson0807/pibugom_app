import { create } from "zustand";

interface OnboardingState {
  gender: string;

  setGender: (gender: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  gender: "",

  setGender: (gender) => set({ gender }),

  reset: () => set({ gender: "" }),
}));
