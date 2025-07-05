import { useAuthStore } from "@/shared/store";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Root redirect component
 * Handles initial routing based on authentication status
 */
export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    // Wait for auth to be initialized
    if (!isInitialized) {
      return;
    }

    // Redirect based on authentication state
    if (!isAuthenticated) {
      console.log("[Index] Redirecting to sign-in");
      router.replace("/(auth)/sign-in");
    } else {
      // Let tabs handle children check
      console.log("[Index] Redirecting to tabs");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized]);

  // Show loading screen while determining route
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
