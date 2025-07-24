import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { useColorScheme } from "@/hooks/useColorScheme";
import { kakaoAuthService } from "@/shared/lib/kakao-auth";
import { queryClient } from "@/shared/lib/queryClient";
import { initializeI18n } from "@/shared/lib/i18n";
import { useAuthStore } from "@/shared/store/authStore";
import {
  initializeThemeStore,
  useThemeStore,
} from "@/shared/store/theme.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GlobalBottomSheet } from "@/shared/ui/GlobalBottomSheet";
import { NotificationInitializer } from "@/shared/components/NotificationInitializer";
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { isLoading, isInitialized, initializeAuth, user } = useAuthStore();
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const segments = useSegments();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    console.log("[RootLayout] user", user);
  }, [user]);

  // 현재 라우터 경로 출력 및 잘못된 경로 리디렉션
  useEffect(() => {
    console.log("[RootLayout] Current pathname:", pathname);
    console.log("[RootLayout] Current segments:", segments);

    // 초기화가 완료되고 폰트가 로드된 후에만 리디렉션 수행
    if (!loaded || !isInitialized) {
      return;
    }

    // +not-found 페이지에서 기타 잘못된 경로인 경우 홈으로 리디렉션
    if (segments.includes("+not-found") && user) {
      console.log("[RootLayout] Redirecting from not-found page");

      setTimeout(() => {
        router.replace("/(tabs)/");
      }, 0);
    }
  }, [pathname, segments, user, loaded, isInitialized]);

  // Initialize i18n on app start
  useEffect(() => {
    const initI18n = async () => {
      try {
        await initializeI18n();
        setI18nInitialized(true);
        console.log("[RootLayout] i18n initialized successfully");
      } catch (error) {
        console.error("[RootLayout] Failed to initialize i18n:", error);
        setI18nInitialized(true); // Continue even if i18n fails
      }
    };
    initI18n();
  }, []);

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

  // Show loading screen while fonts, i18n, or auth are loading
  if (!loaded || !i18nInitialized || !isInitialized || isLoading) {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(onboarding)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <NotificationInitializer />
            <GlobalBottomSheet />
            <StatusBar
              style={theme.colors.background === "#121212" ? "light" : "dark"}
            />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
