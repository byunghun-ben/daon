import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { useThemedStyles } from "../../lib/hooks/useTheme";
import { BUTTON_HEIGHT } from "../../config/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  buttonStyle,
  textStyle,
  loading = false,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: ButtonProps) {
  const styles = useThemedStyles((theme) => ({
    button: {
      borderRadius: theme.borderRadius.md,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      height: BUTTON_HEIGHT,
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    small: {
      paddingHorizontal: theme.spacing.md,
      height: 36,
    },
    medium: {
      paddingHorizontal: theme.spacing.lg,
      height: BUTTON_HEIGHT,
    },
    large: {
      paddingHorizontal: theme.spacing.xl,
      height: 56,
    },
    text: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
    },
    primaryText: {
      color: theme.colors.surface,
    },
    secondaryText: {
      color: theme.colors.surface,
    },
    outlineText: {
      color: theme.colors.primary,
    },
    disabled: {
      opacity: 0.6,
    },
    loadingContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    loadingText: {
      marginLeft: theme.spacing.sm,
    },
  }));

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        buttonStyle,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === "outline" ? "#007AFF" : "#FFFFFF"}
          />
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles.loadingText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
