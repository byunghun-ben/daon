import { create } from "zustand";
import type { ReactNode } from "react";

interface BottomSheetState {
  isOpen: boolean;
  content: ReactNode | null;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  openBottomSheet: (config: {
    content: ReactNode;
    snapPoints?: (string | number)[];
    onClose?: () => void;
  }) => void;
  closeBottomSheet: () => void;
}

export const useBottomSheetStore = create<BottomSheetState>((set, get) => ({
  isOpen: false,
  content: null,
  snapPoints: undefined,
  onClose: undefined,
  openBottomSheet: ({ content, snapPoints, onClose }) => {
    set({
      isOpen: true,
      content,
      snapPoints,
      onClose,
    });
  },
  closeBottomSheet: () => {
    const { onClose } = get();
    onClose?.();
    set({
      isOpen: false,
      content: null,
      snapPoints: undefined,
      onClose: undefined,
    });
  },
}));