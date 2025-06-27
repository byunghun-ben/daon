import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/shared/store";

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
      router.replace("/(auth)/sign-in");
    } else {
      // Let tabs handle children check
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized]);

  // Show loading screen while determining route
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
