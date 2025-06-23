import { useEffect, useState } from "react";
import { checkNotifications } from "react-native-permissions";
import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../../api/children";

interface OnboardingState {
  needsNotificationPermission: boolean;
  needsChildRegistration: boolean;
  isLoading: boolean;
}

export const useOnboarding = () => {
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState(false);

  // 알림 권한 상태 확인
  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        const result = await checkNotifications();
        setNotificationPermissionGranted(result.status === "granted");
      } catch (error) {
        console.error("알림 권한 확인 중 오류:", error);
        setNotificationPermissionGranted(false);
      }
    };

    checkNotificationPermission();
  }, []);

  // 아이 목록 조회
  const { data: children, isLoading: isChildrenLoading } = useQuery({
    queryKey: ["children"],
    queryFn: childrenApi.getChildren,
  });

  const onboardingState: OnboardingState = {
    needsNotificationPermission: !notificationPermissionGranted,
    needsChildRegistration:
      !isChildrenLoading && (!children || children.children.length === 0),
    isLoading: isChildrenLoading,
  };

  const refreshNotificationPermission = async () => {
    const result = await checkNotifications();
    setNotificationPermissionGranted(result.status === "granted");
  };

  return {
    ...onboardingState,
    refreshNotificationPermission,
  };
};
