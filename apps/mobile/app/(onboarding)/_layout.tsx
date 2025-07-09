import { useAuthStore } from "@/shared/store/authStore";
import { Redirect, Stack } from "expo-router";

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    console.log("[OnboardingLayout] Redirecting to sign-in");
    return <Redirect href="/(auth)/sign-in" />;
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
