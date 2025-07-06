import type { UserApi } from "@daon/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { authUtils } from "../api/client";

interface AuthState {
  user: UserApi | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: UserApi | null) => void;
  setLoading: (loading: boolean) => void;
  saveToken: (token: string, refreshToken?: string) => Promise<void>;
}

const STORAGE_KEY = "auth-store";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user: UserApi | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });

        try {
          const token = await authUtils.getStoredToken();
          if (!token) {
            set({
              isLoading: false,
              isInitialized: true,
              isAuthenticated: false,
              user: null,
            });
            return;
          }

          // Validate token by fetching user profile
          const response = await authApi.getProfile();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          console.warn("[AuthStore] Failed to initialize auth:", error);
          // Clear invalid tokens
          await authUtils.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      refreshAuth: async () => {
        set({ isLoading: true });

        try {
          const token = await authUtils.getStoredToken();
          if (!token) {
            throw new Error("No token found");
          }

          const response = await authApi.getProfile();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.warn("[AuthStore] Failed to refresh auth:", error);
          await authUtils.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.signIn({ email, password });
          console.log("[AuthStore] Sign in response:", response?.data?.user);

          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error };
          }
        } catch (error) {
          console.error("[AuthStore] Sign in error:", error);
          set({ isLoading: false });
          return { success: false, error: "로그인 중 오류가 발생했습니다." };
        }
      },

      signUp: async (
        email: string,
        password: string,
        name: string,
        phone?: string,
      ) => {
        set({ isLoading: true });

        try {
          const response = await authApi.signUp({
            email,
            password,
            name,
            phone: phone || "",
          });

          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error };
          }
        } catch (error) {
          console.error("[AuthStore] Sign up error:", error);
          set({ isLoading: false });
          return { success: false, error: "회원가입 중 오류가 발생했습니다." };
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await authApi.signOut();
        } catch (error) {
          console.warn("[AuthStore] Sign out API error:", error);
        } finally {
          // Always clear local state
          set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          authUtils.clearTokens();
        }
      },

      saveToken: async (token: string, refreshToken?: string) => {
        set({ isLoading: true });

        try {
          console.log("[AuthStore] Saving tokens and fetching profile");

          // 토큰을 저장하고 사용자 프로필을 가져옴
          await authUtils.saveTokens(token, refreshToken);

          // 사용자 프로필 가져오기
          const response = await authApi.getProfile();

          // 상태 업데이트를 동기적으로 처리
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log(
            "[AuthStore] Successfully saved tokens and updated user profile",
          );

          // 상태 동기화를 위한 추가 지연
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            "[AuthStore] Failed to save token and get profile:",
            error,
          );
          await authUtils.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Convenience functions
export const getUser = () => useAuthStore.getState().user;
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
export const isAuthLoading = () => useAuthStore.getState().isLoading;
