import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SCREEN_PADDING } from "../../shared/config/theme";
import Button from "../../shared/ui/Button";
import Input from "../../shared/ui/Input";
import { authApi, type SignInRequest } from "../../shared/api/auth";

interface SignInScreenProps {
  navigation: any; // Replace with proper navigation type
}

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [formData, setFormData] = useState<SignInRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignInRequest>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    form: {
      marginBottom: theme.spacing.xl,
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
  const validateForm = (): boolean => {
    const newErrors: Partial<SignInRequest> = {};

    // 이메일 유효성 검사
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }

    // 비밀번호 유효성 검사
    if (!formData.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authApi.signIn(formData);
      Alert.alert("로그인 성공", `환영합니다, ${response.user.name}님!`);

      // 메인 앱으로 이동
      navigation.replace("MainTabs");
    } catch (error: any) {
      console.error("Sign in error:", error);

      // 더 구체적인 에러 메시지 제공
      let errorMessage = "로그인 중 오류가 발생했습니다.";
      if (error.response?.status === 401) {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (error.response?.status === 429) {
        errorMessage =
          "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("로그인 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

        <View style={styles.form}>
          <Input
            label="이메일"
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            accessibilityLabel="이메일 입력 필드"
            accessibilityHint="로그인을 위한 이메일 주소를 입력하세요"
          />

          <Input
            label="비밀번호"
            value={formData.password}
            onChangeText={(password) => setFormData({ ...formData, password })}
            error={errors.password}
            secureTextEntry
            autoComplete="password"
            placeholder="비밀번호를 입력해주세요"
            accessibilityLabel="비밀번호 입력 필드"
            accessibilityHint="로그인을 위한 비밀번호를 입력하세요"
          />

          <Button
            title={isLoading ? "로그인 중..." : "로그인"}
            onPress={handleSignIn}
            disabled={isLoading}
            accessibilityLabel="로그인 버튼"
            accessibilityHint="입력한 정보로 로그인합니다"
          />
        </View>

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
