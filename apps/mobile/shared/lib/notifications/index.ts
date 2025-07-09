import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// 알림 설정 키
const NOTIFICATION_SETTINGS_KEY = "@daon:notification_settings";
const NOTIFICATION_TOKEN_KEY = "@daon:notification_token";

// 알림 카테고리 정의
export enum NotificationCategory {
  FEEDING = "feeding",
  SLEEP = "sleep",
  DIAPER = "diaper",
  GROWTH = "growth",
  MILESTONE = "milestone",
  SUMMARY = "summary",
  REMINDER = "reminder",
}

// 알림 우선순위
export enum NotificationPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// 알림 설정 인터페이스
export interface NotificationSettings {
  enabled: boolean;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      badge: boolean;
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  frequency: {
    feeding: number; // hours
    sleep: number; // hours
    dailySummary: string; // HH:MM format
    weeklyReport: number; // day of week (0-6)
  };
}

// 기본 알림 설정
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  categories: {
    [NotificationCategory.FEEDING]: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
    },
    [NotificationCategory.SLEEP]: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
    },
    [NotificationCategory.DIAPER]: {
      enabled: true,
      sound: false,
      vibration: true,
      badge: true,
    },
    [NotificationCategory.GROWTH]: {
      enabled: true,
      sound: false,
      vibration: false,
      badge: true,
    },
    [NotificationCategory.MILESTONE]: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
    },
    [NotificationCategory.SUMMARY]: {
      enabled: true,
      sound: false,
      vibration: false,
      badge: true,
    },
    [NotificationCategory.REMINDER]: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
    },
  },
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
  },
  frequency: {
    feeding: 3, // 3시간마다
    sleep: 2, // 2시간마다
    dailySummary: "20:00", // 저녁 8시
    weeklyReport: 0, // 일요일
  },
};

// 알림 템플릿 인터페이스
export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  schedule?: NotificationSchedule;
}

// 알림 액션 인터페이스
export interface NotificationAction {
  id: string;
  title: string;
  options?: {
    opensAppToForeground?: boolean;
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
  };
}

// 알림 스케줄 인터페이스
export interface NotificationSchedule {
  type: "immediate" | "scheduled" | "recurring";
  trigger?:
    | Date
    | {
        seconds?: number;
        minute?: number;
        hour?: number;
        day?: number;
        month?: number;
        weekday?: number;
        repeats?: boolean;
      };
  interval?: number; // seconds
}

// 알림 관리자 클래스
export class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // 초기화
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 기본 알림 설정
      await this.setupNotificationHandler();

      // 설정 로드
      await this.loadSettings();

      // 권한 요청
      await this.requestPermissions();

      // 알림 카테고리 등록
      await this.registerCategories();

      this.isInitialized = true;
      console.log("NotificationManager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize NotificationManager:", error);
      throw error;
    }
  }

  // 알림 핸들러 설정
  private async setupNotificationHandler(): Promise<void> {
    // 앱이 포그라운드에 있을 때 알림 표시 설정
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const { category } = notification.request.content.data || {};
        const categorySettings =
          this.settings.categories[category as NotificationCategory];

        // 방해 금지 시간 체크
        if (this.isQuietHours()) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }

        return {
          shouldShowAlert: categorySettings?.enabled ?? true,
          shouldPlaySound: categorySettings?.sound ?? true,
          shouldSetBadge: categorySettings?.badge ?? true,
          shouldShowBanner: categorySettings?.enabled ?? true,
          shouldShowList: categorySettings?.enabled ?? true,
        };
      },
    });
  }

  // 권한 요청
  public async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn("Must use physical device for Push Notifications");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return false;
    }

    // 푸시 토큰 가져오기 및 저장
    await this.getAndStorePushToken();

    return true;
  }

  // 푸시 토큰 가져오기 및 저장
  private async getAndStorePushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // 실제 프로젝트 ID로 교체
      });

      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token.data);
      console.log("Push token stored:", token.data);

      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  // 알림 카테고리 등록
  private async registerCategories(): Promise<void> {
    const categories = [
      {
        identifier: NotificationCategory.FEEDING,
        actions: [
          {
            identifier: "mark_done",
            buttonTitle: "완료",
            options: { opensAppToForeground: false },
          },
          {
            identifier: "snooze",
            buttonTitle: "10분 후",
            options: { opensAppToForeground: false },
          },
        ],
      },
      {
        identifier: NotificationCategory.SLEEP,
        actions: [
          {
            identifier: "mark_done",
            buttonTitle: "완료",
            options: { opensAppToForeground: false },
          },
          {
            identifier: "snooze",
            buttonTitle: "30분 후",
            options: { opensAppToForeground: false },
          },
        ],
      },
      {
        identifier: NotificationCategory.DIAPER,
        actions: [
          {
            identifier: "mark_done",
            buttonTitle: "완료",
            options: { opensAppToForeground: false },
          },
        ],
      },
      {
        identifier: NotificationCategory.REMINDER,
        actions: [
          {
            identifier: "open_app",
            buttonTitle: "앱 열기",
            options: { opensAppToForeground: true },
          },
          {
            identifier: "dismiss",
            buttonTitle: "닫기",
            options: { opensAppToForeground: false },
          },
        ],
      },
    ];

    await Notifications.setNotificationCategoryAsync(
      categories[0].identifier,
      categories[0].actions,
    );

    // 추가 카테고리들도 등록
    for (const category of categories.slice(1)) {
      await Notifications.setNotificationCategoryAsync(
        category.identifier,
        category.actions,
      );
    }
  }

  // 설정 로드
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this.settings = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...JSON.parse(stored),
        };
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  }

  // 설정 저장
  public async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      this.settings = settings;
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(settings),
      );
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      throw error;
    }
  }

  // 현재 설정 가져오기
  public getSettings(): NotificationSettings {
    return this.settings;
  }

  // 방해 금지 시간 체크
  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHours.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = this.settings.quietHours.endTime
      .split(":")
      .map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // 자정을 넘어가는 경우
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // 즉시 알림 보내기
  public async sendImmediate(template: NotificationTemplate): Promise<string> {
    const categorySettings = this.settings.categories[template.category];

    if (!this.settings.enabled || !categorySettings.enabled) {
      console.log(`Notification disabled for category: ${template.category}`);
      return "";
    }

    if (this.isQuietHours()) {
      console.log("Quiet hours active, skipping notification");
      return "";
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: template.title,
        body: template.body,
        data: { ...template.data, category: template.category },
        categoryIdentifier: template.category,
        sound: categorySettings.sound,
        badge: categorySettings.badge ? 1 : undefined,
      },
      trigger: null, // 즉시 전송
    });

    console.log(`Immediate notification sent: ${notificationId}`);
    return notificationId;
  }

  // 예약 알림 보내기
  public async scheduleNotification(
    template: NotificationTemplate,
  ): Promise<string> {
    const categorySettings = this.settings.categories[template.category];

    if (!this.settings.enabled || !categorySettings.enabled) {
      console.log(`Notification disabled for category: ${template.category}`);
      return "";
    }

    if (!template.schedule) {
      throw new Error("Schedule is required for scheduled notifications");
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: template.title,
        body: template.body,
        data: { ...template.data, category: template.category },
        categoryIdentifier: template.category,
        sound: categorySettings.sound,
        badge: categorySettings.badge ? 1 : undefined,
      },
      trigger:
        (template.schedule.trigger as Notifications.NotificationTriggerInput) ||
        null,
    });

    console.log(`Scheduled notification: ${notificationId}`);
    return notificationId;
  }

  // 알림 취소
  public async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification: ${notificationId}`);
  }

  // 모든 알림 취소
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  }

  // 예약된 알림 목록 가져오기
  public async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // 배지 업데이트
  public async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // 배지 초기화
  public async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationManager = NotificationManager.getInstance();
