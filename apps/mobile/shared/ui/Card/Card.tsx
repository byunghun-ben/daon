import React from "react";
import { View, ViewProps } from "react-native";
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
      className={cn("bg-surface rounded-lg p-xl shadow-md", className)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {children}
    </View>
  );
}

