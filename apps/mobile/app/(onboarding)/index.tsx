import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button } from "../../shared/ui";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

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
      color: theme.colors.text,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: theme.typography.body1.fontSize,
      color: theme.colors.textSecondary,
      textAlign: "center" as const,
      lineHeight: theme.typography.body1.lineHeight,
    },
  }));

  const handleStartSetup = () => {
    router.push("/(onboarding)/child-setup");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>다온에 오신 것을 환영합니다!</Text>
          <Text style={styles.subtitle}>
            아이의 소중한 순간들을 기록하고{"\n"}
            성장 과정을 함께 나눠보세요
          </Text>
        </View>

        <Button
          title="아이 프로필 만들기"
          onPress={handleStartSetup}
          variant="primary"
        />
      </SafeAreaView>
    </>
  );
}
