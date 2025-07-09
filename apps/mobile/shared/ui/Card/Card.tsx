import React from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";
import { cn } from "../../lib/utils/cn";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Card({
  children,
  className,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: CardProps) {
  return (
    <View
      className={cn("bg-surface rounded-lg p-4", className)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {children}
    </View>
  );
}
