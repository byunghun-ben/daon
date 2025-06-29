import React from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import { BUTTON_HEIGHT } from "../../config/theme";
import { useThemedStyles } from "../../lib/hooks/useTheme";

interface KakaoButtonProps extends TouchableOpacityProps {
  title?: string;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function KakaoButton({
  title = "카카오톡으로 로그인",
  buttonStyle,
  textStyle,
  ...props
}: KakaoButtonProps) {
  const styles = useThemedStyles((theme) => ({
    button: {
      backgroundColor: "#FEE500",
      borderRadius: theme.borderRadius.md,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      height: BUTTON_HEIGHT,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: "row" as const,
    },
    container: {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
    },
    icon: {
      width: 20,
      height: 20,
      marginRight: theme.spacing.sm,
    },
    text: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "600" as const,
      color: "#000000",
    },
  }));

  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} {...props}>
      <View style={styles.container}>
        <View style={styles.icon}>
          {/* 카카오톡 아이콘 영역 - 나중에 실제 아이콘으로 교체 */}
          <Text style={{ fontSize: 16, color: "#000000" }}>💬</Text>
        </View>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
