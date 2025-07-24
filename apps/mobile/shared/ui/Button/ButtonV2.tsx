import React from "react";
import type { TextProps } from "react-native";
import { Text, TouchableOpacity } from "react-native";
import { cn } from "../../lib/utils/cn";
import { buttonTextVariants, buttonVariants } from "./ButtonV2.styles";
import type { ButtonV2Props } from "./ButtonV2.types";

// Context for passing button styles to children
const ButtonV2Context = React.createContext<{
  variant?: ButtonV2Props["variant"];
  size?: ButtonV2Props["size"];
}>({});

const ButtonV2 = React.forwardRef<
  React.ComponentRef<typeof TouchableOpacity>,
  ButtonV2Props
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <ButtonV2Context.Provider value={{ variant, size }}>
      <TouchableOpacity
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </ButtonV2Context.Provider>
  );
});

// ButtonV2.Text subcomponent
const ButtonText = React.forwardRef<Text, TextProps & { className?: string }>(
  ({ children, className, ...props }, ref) => {
    const { variant, size } = React.useContext(ButtonV2Context);

    return (
      <Text
        ref={ref}
        className={cn(buttonTextVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Text>
    );
  },
);

ButtonText.displayName = "ButtonText";
ButtonV2.displayName = "ButtonV2";

export { ButtonV2, ButtonText, buttonVariants };
export type { ButtonV2Props };
