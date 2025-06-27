import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";

export default function PermissionsScreen() {
  const router = useRouter();

  const handleRequestPermissions = async () => {
    // 권한 요청 로직
    router.replace("/(tabs)");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    content: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
      lineHeight: 20,
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      width: "100%" as const,
      gap: theme.spacing.md,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>알림 권한 설정</Text>
        <Text style={styles.subtitle}>
          중요한 알림을 놓치지 않도록{"\n"}알림 권한을 허용해주세요
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="알림 허용"
          onPress={handleRequestPermissions}
          variant="primary"
        />
        <Button
          title="나중에 설정"
          onPress={handleSkip}
          variant="secondary"
        />
      </View>
    </View>
  );
}