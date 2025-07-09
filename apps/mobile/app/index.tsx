import { useAuthStore } from "@/shared/store/authStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Root redirect component
 * Handles initial routing based on authentication status
 */
export default function Index() {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Wait for auth to be initialized
  if (!isInitialized) {
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

  // Redirect based on authentication state
  if (!isAuthenticated || !user) {
    console.log("[Index] Redirecting to sign-in");
    return <Redirect href="/(auth)/sign-in" />;
  } else if (user?.registrationStatus === "incomplete") {
    // Let tabs handle children check
    console.log("[Index] Redirecting to onboarding");
    return <Redirect href="/(onboarding)" />;
  } else {
    console.log("[Index] Redirecting to tabs");
    return <Redirect href="/(tabs)" />;
  }
}
