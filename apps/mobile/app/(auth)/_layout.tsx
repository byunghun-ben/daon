import { useAuthStore } from "@/shared/store";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to tabs (which will handle children check)
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[AuthLayout] Redirecting to tabs");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  // Don't render auth screens if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // presentation: "modal",
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
