import { Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { childrenApi } from "@/shared/api/children";
import { useAuthStore } from "@/shared/store";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user } = useAuthStore();
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);

  // Check authentication and children
  useEffect(() => {
    const checkChildrenStatus = async () => {
      console.log("[TabLayout] checkChildrenStatus", isAuthenticated, user);
      if (!isAuthenticated) {
        router.replace("/(auth)/sign-in");
        return;
      }

      if (!user) {
        return;
      }

      try {
        const response = await childrenApi.getChildren();
        const childrenCount = response.children?.length || 0;

        setHasChildren(childrenCount > 0);

        if (childrenCount === 0) {
          router.replace("/(onboarding)");
        }
      } catch (error) {
        console.warn("[TabLayout] Failed to fetch children:", error);
        // If can't fetch children, assume none and redirect to onboarding
        setHasChildren(false);
        router.replace("/(onboarding)");
      }
    };

    checkChildrenStatus();
  }, [isAuthenticated, user]);

  // Don't render tabs if not authenticated or no children
  if (!isAuthenticated || !user || hasChildren === false) {
    return null;
  }

  // Show loading while checking children status
  if (hasChildren === null) {
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
        name="chat"
        options={{
          title: "AI 챗봇",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
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
