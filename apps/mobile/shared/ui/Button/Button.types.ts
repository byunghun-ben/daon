import type { VariantProps } from "class-variance-authority";
import type { TouchableOpacityProps } from "react-native";
import type { buttonVariants } from "./Button.styles";

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  // Content
  children?: React.ReactNode;
  title?: string;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // States
  loading?: boolean;

  // Styling
  className?: string;
  textClassName?: string;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Haptic feedback
  hapticFeedback?: boolean;
}
