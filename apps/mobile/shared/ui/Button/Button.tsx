import type { TouchableOpacityProps } from "react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils/cn";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  className?: string;
  textClassName?: string;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  className,
  textClassName,
  loading = false,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonClasses = () => {
    const baseClasses = "rounded-lg justify-center items-center";
    
    const variantClasses = {
      primary: "bg-primary",
      secondary: "bg-secondary", 
      outline: "bg-transparent border border-primary",
    };
    
    const sizeClasses = {
      small: "px-md h-9",
      medium: "px-lg h-12",
      large: "px-xl h-14",
    };
    
    const disabledClasses = isDisabled ? "opacity-60" : "";
    
    return cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabledClasses,
      className
    );
  };

  const getTextClasses = () => {
    const baseClasses = "text-base font-semibold";
    
    const variantTextClasses = {
      primary: "text-white",
      secondary: "text-white",
      outline: "text-primary",
    };
    
    return cn(
      baseClasses,
      variantTextClasses[variant],
      textClassName
    );
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator
            size="small"
            color={variant === "outline" ? "#007AFF" : "#FFFFFF"}
          />
          <Text className={cn(getTextClasses(), "ml-sm")}>
            {title}
          </Text>
        </View>
      ) : (
        <Text className={getTextClasses()}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
