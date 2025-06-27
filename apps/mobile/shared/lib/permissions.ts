import { Alert } from "react-native";

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
        text: "확인",
        onPress: () => {},
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
