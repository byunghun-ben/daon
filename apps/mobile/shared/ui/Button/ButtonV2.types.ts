import type { TouchableOpacityProps } from "react-native";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./ButtonV2.styles";

export interface ButtonV2Props
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  className?: string;
}
