import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

export interface PermissionResult {
  granted: boolean;
  shouldShowRationale?: boolean;
}

/**
 * 권한이 차단된 경우 설정 앱으로 이동 안내 알림
 */
export const showPermissionBlockedAlert = (
  permissionName: string,
  description: string,
) => {
  Alert.alert(
    `${permissionName} 권한이 필요합니다`,
    `${description}\n\n설정에서 권한을 허용해주세요.`,
    [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "설정으로 이동",
        onPress: () => Linking.openSettings(),
      },
    ],
  );
};

/**
 * 권한 요청 이유 설명 알림
 */
export const showPermissionRationaleAlert = (
  permissionName: string,
  description: string,
  onConfirm: () => void,
) => {
  Alert.alert(`${permissionName} 권한 필요`, description, [
    {
      text: "취소",
      style: "cancel",
    },
    {
      text: "권한 허용",
      onPress: onConfirm,
    },
  ]);
};

/**
 * 알림 권한 확인
 */
export const checkNotificationPermission = async (): Promise<PermissionResult> => {
  const { status } = await Notifications.getPermissionsAsync();
  return {
    granted: status === "granted",
  };
};

/**
 * 알림 권한 요청
 */
export const requestNotificationPermission = async (): Promise<PermissionResult> => {
  // 현재 권한 상태 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === "granted") {
    return { granted: true };
  }

  // 권한 요청
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === "denied" && Platform.OS === "ios") {
    // iOS에서는 한 번 거부하면 설정에서만 변경 가능
    showPermissionBlockedAlert(
      "알림",
      "중요한 일정과 활동을 알려드리기 위해 알림 권한이 필요합니다.",
    );
  }

  return {
    granted: status === "granted",
  };
};
