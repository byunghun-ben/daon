import { useAuthStore } from "@/shared/store/authStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function KakaoCallbackScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // 카카오 로그인 콜백 처리 중이 아닌 경우 적절한 페이지로 리디렉션
    console.log("[KakaoCallbackScreen] Redirecting from callback page");

    // 약간의 지연을 주어 화면 깜빡임 최소화
    const timer = setTimeout(() => {
      if (user) {
        // 로그인된 상태라면 홈으로
        router.replace("/(tabs)/");
      } else {
        // 로그인되지 않은 상태라면 로그인 페이지로
        router.replace("/(auth)/sign-in");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text className="text-base text-text mt-4">잠시만 기다려주세요...</Text>
      <Text className="text-sm text-text-secondary mt-2">
        로그인 처리중입니다
      </Text>
    </View>
  );
}
