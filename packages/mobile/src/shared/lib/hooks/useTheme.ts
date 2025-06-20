import { theme, type Theme } from "../../config/theme";

/**
 * Theme hook for accessing theme values throughout the app
 */
export const useTheme = (): Theme => {
  return theme;
};

/**
 * Hook for creating theme-aware styles
 */
export const useThemedStyles = <T>(styleCreator: (theme: Theme) => T): T => {
  return styleCreator(theme);
};