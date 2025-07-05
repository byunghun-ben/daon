import { useAuthStore } from "@/shared/store";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("[OnboardingLayout] Redirecting to sign-in");
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated]);

  // Don't render onboarding if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="child-setup" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
