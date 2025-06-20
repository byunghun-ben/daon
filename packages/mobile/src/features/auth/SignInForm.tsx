import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import z from "zod/v4";
import { authApi } from "../../shared/api/auth";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { Button, Input } from "../../shared/ui";

const SignInFormSchema = z.object({
  email: z
    .email("올바른 이메일 형식을 입력해주세요")
    .min(1, "이메일을 입력해주세요"),
  password: z
    .string()
    .min(6, "비밀번호는 6자 이상이어야 합니다")
    .min(1, "비밀번호를 입력해주세요"),
});

type SignInFormSchemaType = z.infer<typeof SignInFormSchema>;

interface SignInFormProps {
  navigation: any;
}

export const SignInForm = ({ navigation }: SignInFormProps) => {
  const form = useForm<SignInFormSchemaType>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async () => {
    const { success, data, error } = await authApi.signIn(form.getValues());

    if (success) {
      Alert.alert("로그인 성공", `환영합니다, ${data.user.name}님!`);
      navigation.replace("MainTabs");
    } else {
      Alert.alert("로그인 실패", error);
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
