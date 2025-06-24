import { create } from "zustand";

interface OnboardingState {
  onComplete: (() => void) | null;
  setOnComplete: (callback: () => void) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  onComplete: null,

  setOnComplete: (callback: () => void) => {
    set({ onComplete: callback });
  },

  complete: () => {
    const { onComplete } = get();
    if (onComplete) {
      onComplete();
      // 완료 후 상태 초기화
      set({ onComplete: null });
    }
  },

  reset: () => {
    set({ onComplete: null });
  },
}));
