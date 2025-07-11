import { useEffect } from "react";
import { fcmService } from "@/shared/lib/notifications/fcm.service";
import { notificationHandler } from "@/shared/lib/notifications/notification.handler";
import {
  useRegisterFcmToken,
  useUnregisterFcmToken,
} from "@/shared/api/hooks/notifications";
import { useAuthStore } from "@/shared/store/authStore";

export function NotificationInitializer() {
  const { user } = useAuthStore();
  const registerMutation = useRegisterFcmToken();
  const unregisterMutation = useUnregisterFcmToken();

  useEffect(() => {
    // FCM 서비스 초기화
    fcmService.initialize();

    // 알림 핸들러 초기화
    notificationHandler.initialize();

    // 앱이 알림으로 실행된 경우 처리
    notificationHandler.handleLastNotificationResponse();

    // 클린업
    return () => {
      notificationHandler.cleanup();
    };
  }, []);

  // 사용자 로그인/로그아웃 시 토큰 관리
  useEffect(() => {
    if (user) {
      // 로그인 시 토큰 등록
      fcmService.handleLogin(registerMutation);
    } else {
      // 로그아웃 시 토큰 해제
      fcmService.handleLogout(unregisterMutation);
    }
  }, [user]);

  return null;
}
