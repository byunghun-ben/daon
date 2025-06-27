import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams();
  
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
      <Text style={styles.title}>활동 상세 화면 (ID: {id})</Text>
    </SafeAreaView>
  );
}