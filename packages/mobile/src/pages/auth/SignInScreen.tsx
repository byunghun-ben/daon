import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SignInForm } from "../../features/auth";
import { SCREEN_PADDING } from "../../shared/config/theme";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

interface SignInScreenProps {
  navigation: any; // Replace with proper navigation type
}

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center" as const,
      padding: SCREEN_PADDING,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.xxl * 2,
    },
    title: {
      fontSize: theme.typography.title.fontSize,
      fontWeight: theme.typography.title.fontWeight,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.subtitle.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
    },
    footer: {
      alignItems: "center" as const,
      marginTop: theme.spacing.xl,
    },
    linkText: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
      textAlign: "center" as const,
    },
    linkButton: {
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>다온에 오신 것을 환영합니다</Text>
          <Text style={styles.subtitle}>
            아이의 소중한 순간들을 기록해보세요
          </Text>
        </View>

        <SignInForm navigation={navigation} />

        <View style={styles.footer}>
          <Text style={styles.linkText}>
            아직 계정이 없으신가요?{" "}
            <Text
              style={styles.linkButton}
              onPress={() => navigation.navigate("SignUp")}
              accessibilityRole="button"
              accessibilityLabel="회원가입 링크"
              accessibilityHint="회원가입 화면으로 이동합니다"
            >
              회원가입
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
