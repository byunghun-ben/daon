import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { authUtils } from "../../shared/api/client";
import { SyncManager } from "../../shared/lib/sync/syncManager";
import type {
  AuthStackParamList,
  AppStackParamList,
  MainTabParamList,
} from "../../shared/types/navigation";

// Auth Screens
import { SignInScreen, SignUpScreen } from "../../pages/auth";

// Main Screens
import { HomeScreen } from "../../pages/home";
import {
  RecordScreen,
  RecordActivityScreen,
  ActivityListScreen,
} from "../../pages/record";
import {
  DiaryScreen,
  WriteDiaryScreen,
  DiaryListScreen,
} from "../../pages/diary";
import {
  GrowthScreen,
  GrowthChartScreen,
  AddGrowthRecordScreen,
} from "../../pages/growth";
import { SettingsScreen } from "../../pages/settings";

// Children Screens
import { ChildProfileScreen, ChildrenListScreen } from "../../pages/children";

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 인증 컨텍스트 생성
interface AuthContextType {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

// Main app stack navigation
function AppNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Child Management Screens */}
      <AppStack.Screen
        name="ChildrenList"
        component={ChildrenListScreen}
        options={{ title: "아이 관리" }}
      />
      <AppStack.Screen
        name="ChildProfile"
        component={ChildProfileScreen}
        options={{ title: "아이 프로필" }}
      />

      {/* Activity Screens */}
      <AppStack.Screen
        name="RecordActivity"
        component={RecordActivityScreen}
        options={{ title: "활동 기록" }}
      />
      <AppStack.Screen
        name="ActivityList"
        component={ActivityListScreen}
        options={{ title: "활동 내역" }}
      />

      {/* Diary Screens */}
      <AppStack.Screen
        name="WriteDiary"
        component={WriteDiaryScreen}
        options={{ title: "일기 쓰기" }}
      />
      <AppStack.Screen
        name="DiaryList"
        component={DiaryListScreen}
        options={{ title: "일기 목록" }}
      />

      {/* Growth Screens */}
      <AppStack.Screen
        name="GrowthChart"
        component={GrowthChartScreen}
        options={{ title: "성장 차트" }}
      />
      <AppStack.Screen
        name="AddGrowthRecord"
        component={AddGrowthRecordScreen}
        options={{ title: "성장 기록" }}
      />
    </AppStack.Navigator>
  );
}

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSync = () => {
      const syncManager = SyncManager.getInstance();

      // Add network status listener
      syncManager.addSyncListener((isOnline) => {
        console.log("Network status changed:", isOnline ? "Online" : "Offline");
      });
    };

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

  const signIn = useCallback(async () => {
    // 토큰 재확인 후 상태 업데이트
    const token = await authUtils.getStoredToken();
    setIsAuthenticated(!!token);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authUtils.clearTokens();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Root navigation component
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

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

// Main export with AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
