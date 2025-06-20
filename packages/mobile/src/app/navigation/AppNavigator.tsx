import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { authUtils } from "../../shared/api/client";
import { SyncManager } from "../../shared/lib/sync/syncManager";

// Auth Screens
import { SignInScreen, SignUpScreen } from "../../pages/auth";

// Main Screens
import { HomeScreen } from "../../pages/home";
import { RecordScreen, RecordActivityScreen, ActivityListScreen } from "../../pages/record";
import { DiaryScreen, WriteDiaryScreen, DiaryListScreen } from "../../pages/diary";
import { GrowthScreen, GrowthChartScreen, AddGrowthRecordScreen } from "../../pages/growth";
import { SettingsScreen } from "../../pages/settings";

// Children Screens
import { ChildProfileScreen, ChildrenListScreen } from "../../pages/children";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs navigation
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "홈",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          title: "기록",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Diary"
        component={DiaryScreen}
        options={{
          title: "일기",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text>,
        }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthScreen}
        options={{
          title: "성장",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📏</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "설정",
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Auth stack navigation
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// Main app stack navigation
function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Child Management Screens */}
      <Stack.Screen
        name="ChildrenList"
        component={ChildrenListScreen}
        options={{ title: "아이 관리" }}
      />
      <Stack.Screen
        name="ChildProfile"
        component={ChildProfileScreen}
        options={{ title: "아이 프로필" }}
      />
      
      {/* Activity Screens */}
      <Stack.Screen
        name="RecordActivity"
        component={RecordActivityScreen}
        options={{ title: "활동 기록" }}
      />
      <Stack.Screen
        name="ActivityList"
        component={ActivityListScreen}
        options={{ title: "활동 내역" }}
      />
      
      {/* Diary Screens */}
      <Stack.Screen
        name="WriteDiary"
        component={WriteDiaryScreen}
        options={{ title: "일기 쓰기" }}
      />
      <Stack.Screen
        name="DiaryList"
        component={DiaryListScreen}
        options={{ title: "일기 목록" }}
      />
      
      {/* Growth Screens */}
      <Stack.Screen
        name="GrowthChart"
        component={GrowthChartScreen}
        options={{ title: "성장 차트" }}
      />
      <Stack.Screen
        name="AddGrowthRecord"
        component={AddGrowthRecordScreen}
        options={{ title: "성장 기록" }}
      />
    </Stack.Navigator>
  );
}

// Root navigation component
export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    initializeSync();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authUtils.getStoredToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSync = () => {
    const syncManager = SyncManager.getInstance();
    
    // Add network status listener
    syncManager.addSyncListener((isOnline) => {
      console.log("Network status changed:", isOnline ? "Online" : "Offline");
    });
  };

  if (isLoading) {
    // You can replace this with a proper loading screen component
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}