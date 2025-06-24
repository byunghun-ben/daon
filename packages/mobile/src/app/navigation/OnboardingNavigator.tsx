import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { CreateChildScreen } from "../../pages/children";
import {
  ChildOnboardingScreen,
  NotificationPermissionScreen,
} from "../../pages/onboarding";
import { useOnboarding } from "../../shared/lib/hooks/useOnboarding";
import { useOnboardingStore } from "../../shared/store";
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

  const setOnComplete = useOnboardingStore((state) => state.setOnComplete);
  const complete = useOnboardingStore((state) => state.complete);

  // 컴포넌트 마운트 시 onComplete 콜백을 스토어에 저장
  useEffect(() => {
    setOnComplete(onComplete);
  }, [onComplete, setOnComplete]);

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

  const getInitialRouteName = () => {
    if (needsNotificationPermission) {
      return "NotificationPermission";
    }
    if (needsChildRegistration) {
      return "ChildOnboarding";
    }
    return "NotificationPermission"; // fallback
  };

  const handleNotificationPermissionComplete = async (navigation: any) => {
    await refreshNotificationPermission();

    console.log(
      "[OnboardingNavigator] handleNotificationPermissionComplete",
      needsChildRegistration,
    );

    // 알림 권한 완료 후 아이 등록이 필요한지 확인
    if (needsChildRegistration) {
      // 아이 등록 화면으로 이동
      navigation.navigate("ChildOnboarding");
    } else {
      onComplete();
    }
  };

  const handleChildOnboardingComplete = () => {
    complete();
  };

  if (isLoading) {
    return null; // 또는 로딩 스크린
  }

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
            onComplete={() =>
              handleNotificationPermissionComplete(props.navigation)
            }
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

      <Stack.Screen name="CreateChild" options={{ title: "아이 등록" }}>
        {(props) => <CreateChildScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
