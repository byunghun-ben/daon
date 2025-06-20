import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from "react-native";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Create stylesheet with proper typing
 */
export const createStyles = <T extends NamedStyles<T>>(styles: T): T => {
  return StyleSheet.create(styles);
};

/**
 * Merge multiple styles safely
 */
export const mergeStyles = (...styles: (ViewStyle | TextStyle | ImageStyle | undefined | null)[]): any => {
  return StyleSheet.flatten(styles.filter(Boolean));
};

/**
 * Conditional style helper
 */
export const conditionalStyle = (
  condition: boolean,
  trueStyle: ViewStyle | TextStyle | ImageStyle,
  falseStyle?: ViewStyle | TextStyle | ImageStyle,
): ViewStyle | TextStyle | ImageStyle | undefined => {
  return condition ? trueStyle : falseStyle;
};