import type {
  useRegisterFcmToken,
  useUnregisterFcmToken,
} from "@/shared/api/hooks/notifications";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

class FcmService {
  private token: string | null = null;

  /**
   * FCM 토큰 가져오기
   */
  async getFcmToken(): Promise<string | null> {
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

      // iOS에서 APNs 권한 요청
      if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log("Authorization status:", authStatus);
          return null;
        }
      }

      // FCM 토큰 가져오기
      const fcmToken = await messaging().getToken();

      this.token = fcmToken;
      console.log("FCM Token:", this.token);

      return this.token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
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
      const token = await this.getFcmToken();
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
        const token = await this.getFcmToken();
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

  /**
   * FCM 메시지 리스너 설정
   */
  setupMessageListeners() {
    // 포그라운드 메시지 처리
    messaging().onMessage(async (remoteMessage) => {
      console.log("FCM 메시지 수신 (포그라운드):", remoteMessage);

      // Expo Notifications로 로컬 알림 표시
      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || "알림",
            body: remoteMessage.notification.body || "",
            data: remoteMessage.data,
          },
          trigger: null,
        });
      }
    });

    // 백그라운드 메시지 처리
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("FCM 메시지 수신 (백그라운드):", remoteMessage);
    });

    // 토큰 새로 고침 리스너
    messaging().onTokenRefresh((fcmToken) => {
      console.log("FCM 토큰 새로 고침:", fcmToken);
      this.token = fcmToken;
      // 필요시 백엔드에 새 토큰 등록
    });
  }

  /**
   * 서비스 초기화
   */
  async initialize() {
    await this.setupNotificationChannel();
    this.setupMessageListeners();
  }
}

export const fcmService = new FcmService();
