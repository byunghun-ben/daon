import type {
  useRegisterFcmToken,
  useUnregisterFcmToken,
} from "@/shared/api/hooks/notifications";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class FcmService {
  private token: string | null = null;

  /**
   * Expo Push Token 가져오기
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      // 실제 기기인지 확인
      if (!Device.isDevice) {
        console.log("FCM token requires a physical device");
        return null;
      }

      // 권한 확인
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      // Expo Push Token 가져오기
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "57cb1ae6-3b2e-44a6-a54c-da24a38007d2", // EAS 프로젝트 ID
      });

      this.token = tokenData.data;
      console.log("Expo Push Token:", this.token);

      return this.token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  /**
   * FCM 토큰을 백엔드에 등록
   */
  async registerToken(
    registerMutation: ReturnType<typeof useRegisterFcmToken>,
  ): Promise<boolean> {
    try {
      const token = await this.getExpoPushToken();
      if (!token) {
        console.log("No token available to register");
        return false;
      }

      const platform = Platform.OS as "ios" | "android" | "web";
      const deviceInfo = {
        brand: Device.brand,
        deviceName: Device.deviceName,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
      };

      await registerMutation.mutateAsync({
        token,
        platform,
        device_info: deviceInfo,
      });

      console.log("FCM token registered successfully");
      return true;
    } catch (error) {
      console.error("Failed to register FCM token:", error);
      return false;
    }
  }

  /**
   * FCM 토큰을 백엔드에서 해제
   */
  async unregisterToken(
    unregisterMutation: ReturnType<typeof useUnregisterFcmToken>,
  ): Promise<boolean> {
    try {
      if (!this.token) {
        const token = await this.getExpoPushToken();
        if (!token) {
          console.log("No token to unregister");
          return false;
        }
      }

      await unregisterMutation.mutateAsync({
        token: this.token!,
      });

      console.log("FCM token unregistered successfully");
      this.token = null;
      return true;
    } catch (error) {
      console.error("Failed to unregister FCM token:", error);
      return false;
    }
  }

  /**
   * 로그인 시 토큰 등록
   */
  async handleLogin(registerMutation: ReturnType<typeof useRegisterFcmToken>) {
    await this.registerToken(registerMutation);
  }

  /**
   * 로그아웃 시 토큰 해제
   */
  async handleLogout(
    unregisterMutation: ReturnType<typeof useUnregisterFcmToken>,
  ) {
    await this.unregisterToken(unregisterMutation);
  }

  /**
   * 알림 채널 설정 (Android)
   */
  async setupNotificationChannel() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "기본 알림",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB366",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("feeding", {
        name: "수유 알림",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB366",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("diaper", {
        name: "기저귀 알림",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB366",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("sleep", {
        name: "수면 알림",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB366",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("growth", {
        name: "성장 기록 알림",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB366",
        sound: "default",
      });
    }
  }
}

export const fcmService = new FcmService();
