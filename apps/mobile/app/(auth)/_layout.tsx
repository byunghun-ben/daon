import { useAuthStore } from "@/shared/store";
import { Stack, Redirect } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect authenticated users to tabs (which will handle children check)
  if (isAuthenticated) {
    console.log("[AuthLayout] Redirecting to tabs");
    return <Redirect href="/(tabs)" />;
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
