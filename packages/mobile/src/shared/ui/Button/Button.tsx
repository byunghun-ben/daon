import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from "react-native";
import { useThemedStyles } from "../../lib/hooks/useTheme";
import { BUTTON_HEIGHT } from "../../config/theme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  buttonStyle,
  textStyle,
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
  }));

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        buttonStyle,
      ]}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

