import { SafeAreaView, Text } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

export default function EditProfileScreen() {
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
      <Text style={styles.title}>프로필 편집 화면</Text>
    </SafeAreaView>
  );
}
