export const theme = {
  colors: {
    primary: "#4CAF50",
    secondary: "#6c757d",
    background: "#f8f9fa",
    surface: "#fff",
    text: {
      primary: "#333",
      secondary: "#666",
      muted: "#999",
    },
    border: "#e0e0e0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    info: "#2196F3",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: "bold" as const,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "normal" as const,
    },
    body1: {
      fontSize: 16,
      fontWeight: "normal" as const,
    },
    body2: {
      fontSize: 14,
      fontWeight: "normal" as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: "normal" as const,
    },
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};