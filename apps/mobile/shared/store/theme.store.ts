import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";
import { lightTheme, darkTheme, Theme } from "../config/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  systemColorScheme: ColorSchemeName;
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (colorScheme: ColorSchemeName) => void;
  getEffectiveTheme: () => Theme;
}

export type ThemeStore = ThemeState & ThemeActions;

const getInitialTheme = (mode: ThemeMode, systemColorScheme: ColorSchemeName): Theme => {
  if (mode === "system") {
    return systemColorScheme === "dark" ? darkTheme : lightTheme;
  }
  return mode === "dark" ? darkTheme : lightTheme;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      mode: "system",
      theme: lightTheme,
      systemColorScheme: Appearance.getColorScheme(),

      // Actions
      setMode: (mode: ThemeMode) => {
        const { systemColorScheme } = get();
        const newTheme = getInitialTheme(mode, systemColorScheme);
        
        set({
          mode,
          theme: newTheme,
        });
      },

      setSystemColorScheme: (colorScheme: ColorSchemeName) => {
        const { mode } = get();
        const newTheme = getInitialTheme(mode, colorScheme);
        
        set({
          systemColorScheme: colorScheme,
          theme: newTheme,
        });
      },

      getEffectiveTheme: () => {
        const { mode, systemColorScheme } = get();
        return getInitialTheme(mode, systemColorScheme);
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
);

// Initialize system color scheme listener
export const initializeThemeStore = () => {
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    useThemeStore.getState().setSystemColorScheme(colorScheme);
  });

  // Set initial system color scheme
  useThemeStore.getState().setSystemColorScheme(Appearance.getColorScheme());

  return subscription;
};