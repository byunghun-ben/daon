import { Alert, Linking, Platform } from "react-native";
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from "react-native-permissions";

export interface PermissionResult {
  granted: boolean;
  shouldShowRationale?: boolean;
}

/**
 * 카메라 권한 요청
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });

  if (!permission) {
    return { granted: false };
  }

  try {
    const result = await request(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return { granted: true };
      
      case RESULTS.DENIED:
        return { granted: false, shouldShowRationale: true };
      
      case RESULTS.BLOCKED:
        showPermissionBlockedAlert("카메라", "사진 촬영을 위해 카메라 권한이 필요합니다.");
        return { granted: false };
      
      default:
        return { granted: false };
    }
  } catch (error) {
    console.error("카메라 권한 요청 실패:", error);
    return { granted: false };
  }
};

/**
 * 갤러리(사진 라이브러리) 권한 요청
 */
export const requestPhotoLibraryPermission = async (): Promise<PermissionResult> => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: Platform.Version >= 33 
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  });

  if (!permission) {
    return { granted: false };
  }

  try {
    const result = await request(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return { granted: true };
      
      case RESULTS.DENIED:
        return { granted: false, shouldShowRationale: true };
      
      case RESULTS.BLOCKED:
        showPermissionBlockedAlert("갤러리", "사진 선택을 위해 갤러리 접근 권한이 필요합니다.");
        return { granted: false };
      
      default:
        return { granted: false };
    }
  } catch (error) {
    console.error("갤러리 권한 요청 실패:", error);
    return { granted: false };
  }
};

/**
 * 카메라 권한 확인
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });

  if (!permission) return false;

  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error("카메라 권한 확인 실패:", error);
    return false;
  }
};

/**
 * 갤러리 권한 확인
 */
export const checkPhotoLibraryPermission = async (): Promise<boolean> => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: Platform.Version >= 33 
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  });

  if (!permission) return false;

  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error("갤러리 권한 확인 실패:", error);
    return false;
  }
};

/**
 * 권한이 차단된 경우 설정 앱으로 이동 안내 알림
 */
const showPermissionBlockedAlert = (permissionName: string, description: string) => {
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
        onPress: () => openSettings(),
      },
    ]
  );
};

/**
 * 권한 요청 이유 설명 알림
 */
export const showPermissionRationaleAlert = (
  permissionName: string,
  description: string,
  onConfirm: () => void
) => {
  Alert.alert(
    `${permissionName} 권한 필요`,
    description,
    [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "권한 허용",
        onPress: onConfirm,
      },
    ]
  );
};

/**
 * 사진 촬영을 위한 카메라 권한 요청 (사용자 친화적)
 */
export const requestCameraPermissionForPhoto = async (): Promise<boolean> => {
  const hasPermission = await checkCameraPermission();
  if (hasPermission) return true;

  const result = await requestCameraPermission();
  
  if (!result.granted && result.shouldShowRationale) {
    return new Promise((resolve) => {
      showPermissionRationaleAlert(
        "카메라",
        "아이의 소중한 순간을 사진으로 기록하기 위해 카메라 권한이 필요합니다.",
        async () => {
          const retryResult = await requestCameraPermission();
          resolve(retryResult.granted);
        }
      );
    });
  }

  return result.granted;
};

/**
 * 사진 선택을 위한 갤러리 권한 요청 (사용자 친화적)
 */
export const requestPhotoLibraryPermissionForSelection = async (): Promise<boolean> => {
  const hasPermission = await checkPhotoLibraryPermission();
  if (hasPermission) return true;

  const result = await requestPhotoLibraryPermission();
  
  if (!result.granted && result.shouldShowRationale) {
    return new Promise((resolve) => {
      showPermissionRationaleAlert(
        "갤러리",
        "갤러리에서 사진을 선택하여 육아 일기에 추가하기 위해 갤러리 접근 권한이 필요합니다.",
        async () => {
          const retryResult = await requestPhotoLibraryPermission();
          resolve(retryResult.granted);
        }
      );
    });
  }

  return result.granted;
};