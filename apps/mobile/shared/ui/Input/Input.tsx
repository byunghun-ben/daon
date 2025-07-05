import type { TextInputProps, TextStyle, ViewStyle } from "react-native";
import { Text, TextInput, View } from "react-native";
import { INPUT_HEIGHT } from "../../config/theme";
import { useThemedStyles } from "../../lib/hooks/useTheme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: "500" as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    input: {
      height: INPUT_HEIGHT,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      placeholderTextColor: theme.colors.textMuted,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    error: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        placeholderTextColor={styles.input.placeholderTextColor}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="none"
        accessible={true}
        {...props}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
}
