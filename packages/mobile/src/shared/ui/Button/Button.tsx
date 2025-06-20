import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  buttonStyle,
  textStyle,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        buttonStyle,
      ]}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#4CAF50",
  },
  secondary: {
    backgroundColor: "#6c757d",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#4CAF50",
  },
});