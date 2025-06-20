// Theme type definition
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
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
    };
    body1: {
      fontSize: number;
      fontWeight: "normal";
    };
    body2: {
      fontSize: number;
      fontWeight: "normal";
    };
    caption: {
      fontSize: number;
      fontWeight: "normal";
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

export const theme: Theme = {
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