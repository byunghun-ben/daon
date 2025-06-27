import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChildApi } from "@daon/shared";

interface ActiveChildState {
  activeChildId: string | null;
  availableChildren: ChildApi[];
  activeChild: ChildApi | null;

  // Actions
  setActiveChild: (childId: string) => void;
  setAvailableChildren: (children: ChildApi[]) => void;
  initializeActiveChild: () => void;
  clearActiveChild: () => void;
}

const STORAGE_KEY = "active-child-store";

export const useActiveChildStore = create<ActiveChildState>()(
  persist(
    (set, get) => ({
      activeChildId: null,
      availableChildren: [],
      activeChild: null,

      setActiveChild: (childId: string) => {
        const { availableChildren } = get();
        const selectedChild = availableChildren.find(
          (child) => child.id === childId,
        );

        if (selectedChild) {
          set({
            activeChildId: childId,
            activeChild: selectedChild,
          });
        }
      },

      setAvailableChildren: (children: ChildApi[]) => {
        const { activeChildId } = get();

        // 현재 선택된 아이가 여전히 목록에 있는지 확인
        const currentActiveChild = children.find(
          (child) => child.id === activeChildId,
        );

        // 기본 선택: 첫 번째 아이 또는 현재 선택된 아이 유지
        const newActiveChild = currentActiveChild || children[0] || null;

        set({
          availableChildren: children,
          activeChildId: newActiveChild?.id || null,
          activeChild: newActiveChild,
        });
      },

      initializeActiveChild: () => {
        const { availableChildren, activeChildId } = get();

        if (availableChildren.length > 0) {
          // 저장된 activeChildId가 유효한지 확인
          const savedChild = availableChildren.find(
            (child) => child.id === activeChildId,
          );
          const targetChild = savedChild || availableChildren[0];

          set({
            activeChildId: targetChild.id,
            activeChild: targetChild,
          });
        }
      },

      clearActiveChild: () => {
        set({
          activeChildId: null,
          availableChildren: [],
          activeChild: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // activeChildId만 저장하고, availableChildren는 매번 API에서 새로 가져옴
      partialize: (state) => ({
        activeChildId: state.activeChildId,
      }),
    },
  ),
);

// 편의 함수들
export const getActiveChildId = () =>
  useActiveChildStore.getState().activeChildId;
export const getActiveChild = () => useActiveChildStore.getState().activeChild;
export const hasMultipleChildren = () =>
  useActiveChildStore.getState().availableChildren.length > 1;
