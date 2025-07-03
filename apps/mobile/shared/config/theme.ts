// Theme type definition
export interface Theme {
  colors: {
    primary: string;
    primaryDark?: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceSecondary?: string;
    white: string;
    text: string;
    textSecondary: string;
    textMuted?: string;
    onPrimary?: string;
    onSurface?: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    overlay?: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    title: {
      fontSize: number;
      fontWeight: "bold";
    };
    subtitle: {
      fontSize: number;
      fontWeight: "normal";
      lineHeight?: number;
    };
    h3: {
      fontSize: number;
      fontWeight: "bold";
    };
    body1: {
      fontSize: number;
      fontWeight: "normal";
      lineHeight?: number;
    };
    body2: {
      fontSize: number;
      fontWeight: "normal";
    };
    caption: {
      fontSize: number;
      fontWeight: "normal";
    };
    button: {
      fontSize: number;
      fontWeight: "bold";
    };
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

// Light theme
export const lightTheme: Theme = {
  colors: {
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    secondary: "#6c757d",
    background: "#f8f9fa",
    surface: "#ffffff",
    surfaceSecondary: "#f5f5f5",
    white: "#ffffff",
    text: "#212121",
    textSecondary: "#757575",
    textMuted: "#9E9E9E",
    onPrimary: "#ffffff",
    onSurface: "#212121",
    border: "#e0e0e0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    info: "#2196F3",
    overlay: "rgba(0, 0, 0, 0.5)",
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
      lineHeight: 20,
    },
    h3: {
      fontSize: 20,
      fontWeight: "bold" as const,
    },
    body1: {
      fontSize: 16,
      fontWeight: "normal" as const,
      lineHeight: 22,
    },
    body2: {
      fontSize: 14,
      fontWeight: "normal" as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: "normal" as const,
    },
    button: {
      fontSize: 16,
      fontWeight: "bold" as const,
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

// Dark theme
export const darkTheme: Theme = {
  colors: {
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    secondary: "#9E9E9E",
    background: "#121212",
    surface: "#1E1E1E",
    surfaceSecondary: "#2D2D2D",
    white: "#ffffff",
    text: "#FFFFFF",
    textSecondary: "#B3B3B3",
    textMuted: "#757575",
    onPrimary: "#ffffff",
    onSurface: "#FFFFFF",
    border: "#333333",
    success: "#66BB6A",
    warning: "#FFB74D",
    error: "#F48FB1",
    info: "#64B5F6",
    overlay: "rgba(0, 0, 0, 0.7)",
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
      lineHeight: 20,
    },
    h3: {
      fontSize: 20,
      fontWeight: "bold" as const,
    },
    body1: {
      fontSize: 16,
      fontWeight: "normal" as const,
      lineHeight: 22,
    },
    body2: {
      fontSize: 14,
      fontWeight: "normal" as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: "normal" as const,
    },
    button: {
      fontSize: 16,
      fontWeight: "bold" as const,
    },
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Default theme (light)
export const theme = lightTheme;

// Theme constants
export const SCREEN_PADDING = theme.spacing.xl;
export const CARD_BORDER_RADIUS = theme.borderRadius.lg;
export const BUTTON_HEIGHT = 48;
export const INPUT_HEIGHT = 44;

// Common color palette for baby tracking app
export const COLORS = {
  // Baby-friendly colors
  baby: {
    pink: "#FFB6C1",
    blue: "#ADD8E6",
    yellow: "#FFFFE0",
    green: "#98FB98",
    purple: "#DDA0DD",
  },
  // Activity colors
  activity: {
    feeding: "#4CAF50",
    diaper: "#FF9800",
    sleep: "#673AB7",
    tummyTime: "#2196F3",
    custom: "#9C27B0",
  },
} as const;

// Export theme type for use in components
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
