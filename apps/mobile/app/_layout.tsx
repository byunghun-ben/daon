import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import type { Notification } from "expo-notifications";
import {
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from "expo-notifications";
import type { RelativePathString } from "expo-router";
import { Stack, router, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { kakaoAuthService } from "@/shared/lib/kakao-auth";
import { queryClient } from "@/shared/lib/queryClient";
import { useAuthStore } from "@/shared/store";
import {
  initializeThemeStore,
  useThemeStore,
} from "@/shared/store/theme.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "../global.css";

const useNotificationObserver = () => {
  useEffect(() => {
    let isMounted = true;

    const redirect = (notification: Notification) => {
      const url = notification.request.content.data?.url;
      if (url) {
        // TODO: 타입 수정
        router.push(url as RelativePathString);
      }
    };

    getLastNotificationResponseAsync().then((response) => {
      console.log(
        "[useNotificationObserver] getLastNotificationResponseAsync",
        response,
      );

      if (!isMounted || !response?.notification) {
        return;
      }
      console.log("[useNotificationObserver] redirect", response?.notification);
      redirect(response?.notification);
    });

    const subscription = addNotificationResponseReceivedListener((response) => {
      console.log(
        "[useNotificationObserver] addNotificationResponseReceivedListener",
        response,
      );
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { isLoading, isInitialized, initializeAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const segments = useSegments();

  // 현재 라우터 경로 출력
  useEffect(() => {
    console.log("[RootLayout] Current pathname:", pathname);
    console.log("[RootLayout] Current segments:", segments);
  }, [pathname, segments]);

  useNotificationObserver();

  // Initialize theme store on app start
  useEffect(() => {
    const subscription = initializeThemeStore();
    return () => subscription?.remove();
  }, []);

  // Initialize auth on app start
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Initialize Kakao auth service on app start
  useEffect(() => {
    kakaoAuthService.checkInitialURL();

    // Cleanup on unmount
    return () => {
      kakaoAuthService.cleanup();
    };
  }, []);

  // Show loading screen while fonts or auth are loading
  if (!loaded || !isInitialized || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center" as const,
          alignItems: "center" as const,
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar
          style={theme.colors.background === "#121212" ? "light" : "dark"}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
