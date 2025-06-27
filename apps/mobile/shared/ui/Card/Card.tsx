import React from "react";
import { View, ViewStyle } from "react-native";
import { useThemedStyles } from "../../lib/hooks/useTheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  const styles = useThemedStyles((theme) => ({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.md,
    },
  }));

  return <View style={[styles.card, style]}>{children}</View>;
}

