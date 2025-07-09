import { useThemedStyles } from "@/shared/lib/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import type { SignUpFormSchemaType } from "@/shared/types/auth.forms";
import { SignUpFormSchema } from "@/shared/types/auth.forms";
import Button from "@/shared/ui/Button/Button";
import Input from "@/shared/ui/Input/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

const normalizePhoneNumber = (value: string) => {
  // 숫자만 추출 (하이픈 등 특수문자 제거)
  return value.replace(/\D/g, "");
};

export const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<SignUpFormSchemaType>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      phone: "",
    },
  });

  const { signUp } = useAuthStore();

  const handleSignUp = async () => {
    try {
      const email = form.getValues("email");
      const password = form.getValues("password");
      const name = form.getValues("name");
      const phone = form.getValues("phone");
      const { success, error } = await signUp(email, password, name, phone);

      if (success) {
        Alert.alert(
          "회원가입 성공",
          `환영합니다, ${name}님! 다온을 시작해보세요.`,
          [
            {
              text: "확인",
              onPress: () => {
                console.log("[SignUpForm] Redirecting to onboarding");
                router.replace("/(onboarding)");
              },
            },
          ],
        );
      } else {
        Alert.alert("회원가입 실패", error);
      }
    } catch (error: unknown) {
      console.error("회원가입 중 오류:", error);
      Alert.alert(
        "회원가입 실패",
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
    }
  };

  const styles = useThemedStyles((theme) => ({
    form: {
      marginBottom: theme.spacing.xl,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
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
            placeholder="비밀번호를 입력해주세요"
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
            placeholder="비밀번호를 다시 입력해주세요"
          />
        )}
      />

      {/* Divider */}
      <View style={styles.divider} />

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
            placeholder="이름을 입력해주세요"
          />
        )}
      />

      <Controller
        control={form.control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="전화번호"
            value={value}
            onChangeText={(text) => {
              const normalized = normalizePhoneNumber(text);
              onChange(normalized);
            }}
            onBlur={onBlur}
            error={form.formState.errors.phone?.message}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="01012345678"
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
