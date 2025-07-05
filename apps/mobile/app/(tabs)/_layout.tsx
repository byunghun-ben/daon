import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { authApi } from "@/shared/api/auth";
import { useAuthStore } from "@/shared/store";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user, setUser } = useAuthStore();

  // Check authentication and registration status
  useEffect(() => {
    console.log(
      "[TabLayout] Auth check",
      isAuthenticated,
      user?.registrationStatus,
    );

    if (!isAuthenticated) {
      console.log("[TabLayout] Not authenticated, redirecting to sign-in");
      router.replace("/(auth)/sign-in");
      return;
    }

    // Check registration status instead of making API call
    if (user?.registrationStatus === "incomplete") {
      console.log(
        "[TabLayout] User registration incomplete, checking if has children...",
      );
      
      // Check if user actually has children and auto-update status
      authApi.checkRegistrationStatus()
        .then((response) => {
          if (response.statusUpdated) {
            console.log("[TabLayout] Registration status auto-updated to completed");
            setUser(response.user);
          } else {
            console.log("[TabLayout] Registration still incomplete, redirecting to onboarding");
            router.replace("/(onboarding)");
          }
        })
        .catch((error) => {
          console.error("[TabLayout] Failed to check registration status:", error);
          // On error, redirect to onboarding to be safe
          router.replace("/(onboarding)");
        });
      
      return;
    }
  }, [isAuthenticated, user, setUser]);

  // Don't render tabs if not authenticated or registration incomplete
  if (!isAuthenticated || !user || user.registrationStatus === "incomplete") {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          // ios: {
          //   // Use a transparent background on iOS to show the blur effect
          //   position: 'absolute',
          // },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: "기록",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "일기",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: "성장",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chart.line.uptrend.xyaxis"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "분석",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
