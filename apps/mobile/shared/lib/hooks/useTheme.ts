import { type Theme } from "../../config/theme";
import { useThemeStore } from "../../store/theme.store";

/**
 * Theme hook for accessing theme values throughout the app
 */
export const useTheme = (): Theme => {
  return useThemeStore((state) => state.theme);
};

/**
 * Hook for creating theme-aware styles
 */
export const useThemedStyles = <T>(styleCreator: (theme: Theme) => T): T => {
  const theme = useTheme();
  return styleCreator(theme);
};