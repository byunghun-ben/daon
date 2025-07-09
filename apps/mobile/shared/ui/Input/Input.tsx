import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";
import { cn } from "../../lib/utils/cn";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Input({
  label,
  error,
  containerClassName,
  inputClassName,
  labelClassName,
  errorClassName,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  return (
    <View className={cn("mb-md", containerClassName)}>
      {label && (
        <Text className={cn("text-sm font-medium text-text mb-xs", labelClassName)}>
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          "h-11 border border-border rounded-md px-md text-base text-text bg-surface",
          error && "border-error",
          inputClassName
        )}
        placeholderTextColor="#9E9E9E"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="none"
        accessible={true}
        {...props}
      />
      {error && (
        <Text className={cn("text-xs text-error mt-xs", errorClassName)}>
          {error}
        </Text>
      )}
    </View>
  );
}
