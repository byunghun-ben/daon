import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  NotificationPermissionScreen,
  ChildOnboardingScreen,
} from "../../pages/onboarding";
import { ChildProfileScreen } from "../../pages/children";
import { useOnboarding } from "../../shared/lib/hooks/useOnboarding";
import { useAuth } from "./AppNavigator";
import type { OnboardingStackParamList } from "../../shared/types/navigation";

const Stack = createStackNavigator<OnboardingStackParamList>();

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

export const OnboardingNavigator = ({
  onComplete,
}: OnboardingNavigatorProps) => {
  const {
    needsNotificationPermission,
    needsChildRegistration,
    isLoading,
    refreshNotificationPermission,
  } = useOnboarding();

  useEffect(() => {
    if (!isLoading && !needsNotificationPermission && !needsChildRegistration) {
      // 온보딩이 모두 완료된 경우
      onComplete();
    }
  }, [
    needsNotificationPermission,
    needsChildRegistration,
    isLoading,
    onComplete,
  ]);

  if (isLoading) {
    return null; // 또는 로딩 스크린
  }

  const getInitialRouteName = () => {
    if (needsNotificationPermission) {
      return "NotificationPermission";
    }
    if (needsChildRegistration) {
      return "ChildOnboarding";
    }
    return "NotificationPermission"; // fallback
  };

  const handleNotificationPermissionComplete = async () => {
    await refreshNotificationPermission();

    // 알림 권한 완료 후 아이 등록이 필요한지 확인
    if (needsChildRegistration) {
      // 아이 등록 화면으로 이동 (자동으로 스택에서 처리됨)
    } else {
      onComplete();
    }
  };

  const handleChildOnboardingComplete = () => {
    onComplete();
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="NotificationPermission"
        options={{ headerShown: false }}
      >
        {(props) => (
          <NotificationPermissionScreen
            {...props}
            onComplete={handleNotificationPermissionComplete}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ChildOnboarding" options={{ headerShown: false }}>
        {(props) => (
          <ChildOnboardingScreen
            {...props}
            onComplete={handleChildOnboardingComplete}
          />
        )}
      </Stack.Screen>

      <Stack.Screen 
        name="ChildProfile"
        options={{ title: "아이 프로필" }}
      >
        {(props) => (
          <ChildProfileScreen
            {...props}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
