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
import { authApi, type SignUpRequest } from "../../shared/api/auth";

interface SignUpScreenProps {
  navigation: any; // Replace with proper navigation type
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [formData, setFormData] = useState<SignUpRequest>({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpRequest>>({});
  const [isLoading, setIsLoading] = useState(false);

  const styles = useThemedStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
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
    const newErrors: Partial<SignUpRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "이름은 2자 이상이어야 합니다";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }

    if (!formData.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authApi.signUp(formData);
      Alert.alert(
        "회원가입 성공",
        `환영합니다, ${response.user.name}님! 이제 아이의 첫 프로필을 만들어보세요.`,
        [
          {
            text: "확인",
            onPress: () => navigation.replace("MainTabs"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "회원가입 실패",
        error.message || "회원가입 중 오류가 발생했습니다."
      );
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
      >
        <View style={styles.header}>
          <Text style={styles.title}>다온과 함께 시작하세요</Text>
          <Text style={styles.subtitle}>
            아이의 성장을 기록하고 소중한 순간들을 남겨보세요
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="이름"
            value={formData.name}
            onChangeText={(name) => setFormData({ ...formData, name })}
            error={errors.name}
            autoComplete="name"
            autoCapitalize="words"
          />

          <Input
            label="이메일"
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="비밀번호"
            value={formData.password}
            onChangeText={(password) => setFormData({ ...formData, password })}
            error={errors.password}
            secureTextEntry
            autoComplete="password-new"
          />

          <Button
            title={isLoading ? "가입 중..." : "회원가입"}
            onPress={handleSignUp}
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.linkText}>
            이미 계정이 있으신가요?{" "}
            <Text
              style={styles.linkButton}
              onPress={() => navigation.navigate("SignIn")}
            >
              로그인
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}