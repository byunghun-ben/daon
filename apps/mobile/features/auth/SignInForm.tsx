import { useAuthStore } from "@/shared/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { SignInFormSchema, SignInFormSchemaType } from "../../shared/types";
import { Button, Input } from "../../shared/ui";

export const SignInForm = () => {
  const router = useRouter();

  const form = useForm<SignInFormSchemaType>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn } = useAuthStore();

  const handleSignIn = async () => {
    try {
      const email = form.getValues("email");
      const password = form.getValues("password");
      const { success, error } = await signIn(email, password);

      if (success) {
        // 로그인 성공 - 메인 화면으로 이동
        console.log("[SignInForm] 로그인 성공");
        router.replace("/(tabs)");
      } else {
        Alert.alert("로그인 실패", error);
      }
    } catch (error) {
      console.error("로그인 중 오류:", error);
      Alert.alert("오류", "로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const styles = useThemedStyles((theme) => ({
    form: {
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
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
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="이메일"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={form.formState.errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="이메일을 입력해주세요"
            accessibilityLabel="이메일 입력 필드"
            accessibilityHint="로그인을 위한 이메일 주소를 입력하세요"
          />
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="비밀번호"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={form.formState.errors.password?.message}
            secureTextEntry
            autoComplete="password"
            placeholder="비밀번호를 입력해주세요"
            accessibilityLabel="비밀번호 입력 필드"
            accessibilityHint="로그인을 위한 비밀번호를 입력하세요"
          />
        )}
      />

      <Button
        title={form.formState.isSubmitting ? "로그인 중..." : "로그인"}
        onPress={form.handleSubmit(handleSignIn)}
        disabled={form.formState.isSubmitting}
        accessibilityLabel="로그인 버튼"
        accessibilityHint="입력한 정보로 로그인합니다"
      />
    </View>
  );
};
