import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod/v4";
import { Alert, View } from "react-native";
import { Button, Input } from "../../shared/ui";
import { authApi } from "../../shared/api/auth";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";

const SignUpFormSchema = z
  .object({
    email: z
      .email("올바른 이메일 형식을 입력해주세요")
      .min(1, "이메일을 입력해주세요"),
    password: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .min(1, "비밀번호를 입력해주세요"),
    passwordConfirm: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .min(1, "비밀번호를 입력해주세요"),
    name: z.string().min(1, "이름을 입력해주세요"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

type SignUpFormSchemaType = z.infer<typeof SignUpFormSchema>;

interface SignUpFormProps {
  navigation: any;
}

export const SignUpForm = ({ navigation }: SignUpFormProps) => {
  const form = useForm<SignUpFormSchemaType>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    },
  });

  const handleSignUp = async () => {
    try {
      const { success, data, error } = await authApi.signUp(form.getValues());

      if (success) {
        Alert.alert(
          "회원가입 성공",
          `환영합니다, ${data.user.name}님! 이제 아이의 첫 프로필을 만들어보세요.`,
          [
            {
              text: "확인",
              onPress: () => navigation.replace("MainTabs"),
            },
          ]
        );
      } else {
        Alert.alert("회원가입 실패", error);
      }
    } catch (error: unknown) {
      Alert.alert(
        "회원가입 실패",
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다."
      );
    }
  };

  const styles = useThemedStyles((theme) => ({
    form: {
      marginBottom: theme.spacing.xl,
    },
  }));

  return (
    <View style={styles.form}>
      <Controller
        control={form.control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="이름"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={form.formState.errors.name?.message}
            autoComplete="name"
            autoCapitalize="words"
          />
        )}
      />

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
            autoComplete="password-new"
          />
        )}
      />

      <Controller
        control={form.control}
        name="passwordConfirm"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="비밀번호 확인"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={form.formState.errors.passwordConfirm?.message}
            secureTextEntry
            autoComplete="password-new"
          />
        )}
      />

      <Button
        title={form.formState.isSubmitting ? "가입 중..." : "회원가입"}
        onPress={form.handleSubmit(handleSignUp)}
        disabled={form.formState.isSubmitting}
      />
    </View>
  );
};
