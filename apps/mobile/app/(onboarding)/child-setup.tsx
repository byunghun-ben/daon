import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";

export default function ChildSetupScreen() {
  const router = useRouter();

  const handleStartRegistration = () => {
    router.push("/children/create");
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
      lineHeight: theme.typography.body1.lineHeight,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>아이 프로필 설정</Text>
        <Text style={styles.subtitle}>
          아이의 정보를 입력하여{"\n"}성장 기록을 시작해보세요
        </Text>
      </View>
      
      <Button
        title="시작하기"
        onPress={handleStartRegistration}
        variant="primary"
      />
    </View>
  );
}