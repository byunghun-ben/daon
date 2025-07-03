import React from "react";
import { View, ViewStyle, ViewProps } from "react-native";
import { useThemedStyles } from "../../lib/hooks/useTheme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Card({ 
  children, 
  style, 
  accessibilityLabel,
  accessibilityHint,
  ...props 
}: CardProps) {
  const styles = useThemedStyles((theme) => ({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.md,
    },
  }));

  return (
    <View 
      style={[styles.card, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {children}
    </View>
  );
}

