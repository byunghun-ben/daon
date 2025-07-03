import { SafeAreaView, Text } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function NotificationsScreen() {
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
      color: theme.colors.text,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>알림 설정 화면</Text>
    </SafeAreaView>
  );
}
