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
  }));\n\n  const validateForm = (): boolean => {\n    const newErrors: Partial<SignInRequest> = {};\n\n    if (!formData.email.trim()) {\n      newErrors.email = \"이메일을 입력해주세요\";\n    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {\n      newErrors.email = \"올바른 이메일 형식을 입력해주세요\";\n    }\n\n    if (!formData.password.trim()) {\n      newErrors.password = \"비밀번호를 입력해주세요\";\n    } else if (formData.password.length < 6) {\n      newErrors.password = \"비밀번호는 6자 이상이어야 합니다\";\n    }\n\n    setErrors(newErrors);\n    return Object.keys(newErrors).length === 0;\n  };\n\n  const handleSignIn = async () => {\n    if (!validateForm()) return;\n\n    setIsLoading(true);\n    try {\n      const response = await authApi.signIn(formData);\n      Alert.alert(\"로그인 성공\", `환영합니다, ${response.user.name}님!`);\n      // Navigate to main app\n      navigation.replace(\"MainTabs\");\n    } catch (error: any) {\n      Alert.alert(\n        \"로그인 실패\",\n        error.message || \"로그인 중 오류가 발생했습니다.\"\n      );\n    } finally {\n      setIsLoading(false);\n    }\n  };\n\n  return (\n    <KeyboardAvoidingView\n      style={styles.container}\n      behavior={Platform.OS === \"ios\" ? \"padding\" : \"height\"}\n    >\n      <ScrollView\n        contentContainerStyle={styles.scrollContainer}\n        keyboardShouldPersistTaps=\"handled\"\n      >\n        <View style={styles.header}>\n          <Text style={styles.title}>다온에 오신 것을 환영합니다</Text>\n          <Text style={styles.subtitle}>\n            아이의 소중한 순간들을 기록해보세요\n          </Text>\n        </View>\n\n        <View style={styles.form}>\n          <Input\n            label=\"이메일\"\n            value={formData.email}\n            onChangeText={(email) => setFormData({ ...formData, email })}\n            error={errors.email}\n            keyboardType=\"email-address\"\n            autoCapitalize=\"none\"\n            autoComplete=\"email\"\n          />\n\n          <Input\n            label=\"비밀번호\"\n            value={formData.password}\n            onChangeText={(password) => setFormData({ ...formData, password })}\n            error={errors.password}\n            secureTextEntry\n            autoComplete=\"password\"\n          />\n\n          <Button\n            title={isLoading ? \"로그인 중...\" : \"로그인\"}\n            onPress={handleSignIn}\n            disabled={isLoading}\n          />\n        </View>\n\n        <View style={styles.footer}>\n          <Text style={styles.linkText}>\n            아직 계정이 없으신가요?{\" \"}\n            <Text\n              style={styles.linkButton}\n              onPress={() => navigation.navigate(\"SignUp\")}\n            >\n              회원가입\n            </Text>\n          </Text>\n        </View>\n      </ScrollView>\n    </KeyboardAvoidingView>\n  );\n}"