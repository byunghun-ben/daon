import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function NewDiaryScreen() {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>새 일기 작성 화면</Text>
    </SafeAreaView>
  );
}