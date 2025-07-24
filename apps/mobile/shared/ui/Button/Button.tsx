import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils/cn";
import { buttonTextVariants, buttonVariants } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

function Button({
  children,
  title,
  variant,
  size,
  fullWidth,
  rounded,
  shadow,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  textClassName,
  accessibilityLabel,
  accessibilityHint,
  hapticFeedback = true,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Haptic feedback handler
  const handlePress = (
    event: Parameters<NonNullable<ButtonProps["onPress"]>>[0],
  ) => {
    if (hapticFeedback) {
      // React Native haptic feedback would go here
      // HapticFeedback.impact(HapticFeedbackTypes.light);
    }
    props.onPress?.(event);
  };

  const buttonClasses = cn(
    buttonVariants({
      variant,
      size,
      fullWidth,
      rounded,
      shadow,
    }),
    isDisabled && "opacity-50",
    className,
  );

  const textClasses = cn(buttonTextVariants({ variant, size }), textClassName);

  const content = children || title;
  const showText = content && size !== "icon";

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ||
        (typeof content === "string" ? content : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
      onPress={handlePress}
    >
      {loading ? (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator
            size="small"
            color={
              variant === "outline" || variant === "ghost"
                ? "#4CAF50"
                : "#FFFFFF"
            }
          />
          {showText && (
            <Text className={textClasses}>
              {typeof content === "string" ? content : "Loading..."}
            </Text>
          )}
        </View>
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          {showText && <Text className={textClasses}>{content}</Text>}
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

Button.displayName = "Button";

export default Button;
export { Button, buttonVariants };
export type { ButtonProps };
