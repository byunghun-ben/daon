import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextAreaProps extends Omit<TextInputProps, "multiline"> {
  label?: string;
  error?: string;
  rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  rows = 4,
  className,
  ...props
}) => {
  return (
    <View>
      {label && (
        <Text className="text-lg font-semibold text-foreground mb-3">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-surface border border-border rounded-lg p-4 text-base text-foreground ${
          error ? "border-destructive" : ""
        } ${className || ""}`}
        style={{
          textAlignVertical: "top",
          minHeight: rows * 24, // 대략적인 행 높이
        }}
        multiline
        numberOfLines={rows}
        {...props}
      />
      {error && <Text className="text-destructive text-sm mt-2">{error}</Text>}
    </View>
  );
};

export default TextArea;
