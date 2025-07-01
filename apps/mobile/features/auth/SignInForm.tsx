import { useAuthStore } from "@/shared/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { useThemedStyles } from "../../shared/lib/hooks/useTheme";
import { kakaoAuthService } from "../../shared/lib/kakao-auth";
import {
  SignInFormSchema,
  type SignInFormSchemaType,
} from "../../shared/types";
import { Button, Input, KakaoButton } from "../../shared/ui";

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

  const handleKakaoSignIn = async () => {
    try {
      console.log("[SignInForm] 카카오톡 로그인 시도");

      const result = await kakaoAuthService.login();
      console.log("[SignInForm] 카카오 로그인 결과:", {
        success: result.success,
        hasToken: !!result.token,
        needsChildSetup: result.needsChildSetup,
        error: result.error,
      });

      if (result.success && result.token) {
        // 카카오톡 로그인 성공 - 토큰을 사용해 인증 상태 업데이트
        console.log("[SignInForm] 카카오톡 로그인 성공");

        // AuthStore에 토큰 저장 (임시 구현)
        // 실제로는 signInWithKakao 같은 메서드를 구현해야 함
        const { saveToken } = useAuthStore.getState();
        await saveToken(result.token, result.refreshToken);

        // 아이 설정이 필요한지 확인하고 적절한 화면으로 이동
        // 네비게이션 스택이 준비될 때까지 약간의 지연
        setTimeout(() => {
          try {
            if (result.needsChildSetup) {
              console.log("[SignInForm] Navigating to child setup");
              router.replace("/(onboarding)/child-setup");
            } else {
              console.log("[SignInForm] Navigating to main tabs");
              router.replace("/(tabs)");
            }
          } catch (navError) {
            console.error("[SignInForm] Navigation error:", navError);
            // 폴백: 메인 화면으로 이동
            router.replace("/");
          }
        }, 100);
      } else {
        Alert.alert(
          "카카오톡 로그인 실패",
          result.error || "알 수 없는 오류가 발생했습니다",
        );
      }
    } catch (error) {
      console.error("카카오톡 로그인 중 오류:", error);
      Alert.alert(
        "오류",
        "카카오톡 로그인 중 문제가 발생했습니다. 다시 시도해주세요.",
      );
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
    divider: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.text.secondary,
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

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <KakaoButton
        onPress={handleKakaoSignIn}
        accessibilityLabel="카카오톡으로 로그인"
        accessibilityHint="카카오톡 계정으로 간편하게 로그인합니다"
      />
    </View>
  );
};
