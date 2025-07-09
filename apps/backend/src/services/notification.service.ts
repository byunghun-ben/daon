import { supabase } from "@/lib/supabase.js";
import type { Json } from "@/types/supabase.js";
import { logger } from "@/utils/logger.js";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";

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

// 알림 템플릿 인터페이스
export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  titleKey: string;
  bodyKey: string;
  data?: Record<string, unknown>;
}

// 푸시 토큰 인터페이스
export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  device_id?: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// 알림 설정 인터페이스
export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean | null;
  categories: Record<
    NotificationCategory,
    {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      badge: boolean;
    }
  > | null;
  quiet_hours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  } | null;
  frequency: {
    feeding: number;
    sleep: number;
    dailySummary: string;
    weeklyReport: number;
  } | null;
  language: string | null;
  timezone: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// 예약된 알림 인터페이스
export interface ScheduledNotification {
  id: string;
  user_id: string;
  child_id: string | null;
  category: string;
  template_key: string;
  template_data: Json | null;
  scheduled_at: string;
  status: string | null;
  attempts: number | null;
  last_attempt_at: string | null;
  error_message: string | null;
  expo_ticket_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// 다국어 템플릿 정의
const NOTIFICATION_TEMPLATES = {
  ko: {
    feeding: {
      reminder: {
        title: "수유 시간이에요!",
        body: "{{childName}}의 수유 시간입니다. 마지막 수유로부터 {{hours}}시간이 지났어요.",
      },
      overdue: {
        title: "수유가 늦어지고 있어요",
        body: "{{childName}}의 수유가 예정보다 늦어지고 있습니다.",
      },
    },
    sleep: {
      bedtime: {
        title: "잠잘 시간이에요",
        body: "{{childName}}의 잠잘 시간입니다. 좋은 꿈 꾸세요!",
      },
      naptime: {
        title: "낮잠 시간",
        body: "{{childName}}의 낮잠 시간입니다.",
      },
    },
    diaper: {
      reminder: {
        title: "기저귀 확인",
        body: "{{childName}}의 기저귀를 확인해 주세요.",
      },
    },
    growth: {
      measurement: {
        title: "성장 기록 시간",
        body: "{{childName}}의 키와 몸무게를 측정해 보세요.",
      },
    },
    milestone: {
      reminder: {
        title: "마일스톤 기록",
        body: "{{childName}}의 새로운 성장 순간을 기록해 보세요!",
      },
    },
    summary: {
      daily: {
        title: "오늘의 육아 요약",
        body: "{{childName}}의 하루 활동을 확인해 보세요.",
      },
      weekly: {
        title: "주간 육아 리포트",
        body: "{{childName}}의 이번 주 성장과 활동을 확인해 보세요.",
      },
    },
    reminder: {
      general: {
        title: "알림",
        body: "{{message}}",
      },
    },
  },
  en: {
    feeding: {
      reminder: {
        title: "Feeding Time!",
        body: "It's time to feed {{childName}}. {{hours}} hours have passed since the last feeding.",
      },
      overdue: {
        title: "Feeding is overdue",
        body: "{{childName}}'s feeding is running late.",
      },
    },
    sleep: {
      bedtime: {
        title: "Bedtime",
        body: "It's bedtime for {{childName}}. Sweet dreams!",
      },
      naptime: {
        title: "Nap Time",
        body: "It's nap time for {{childName}}.",
      },
    },
    diaper: {
      reminder: {
        title: "Diaper Check",
        body: "Please check {{childName}}'s diaper.",
      },
    },
    growth: {
      measurement: {
        title: "Growth Recording Time",
        body: "Time to measure {{childName}}'s height and weight.",
      },
    },
    milestone: {
      reminder: {
        title: "Milestone Recording",
        body: "Record {{childName}}'s new growth moment!",
      },
    },
    summary: {
      daily: {
        title: "Today's Parenting Summary",
        body: "Check {{childName}}'s daily activities.",
      },
      weekly: {
        title: "Weekly Parenting Report",
        body: "Check {{childName}}'s growth and activities this week.",
      },
    },
    reminder: {
      general: {
        title: "Reminder",
        body: "{{message}}",
      },
    },
  },
  ja: {
    feeding: {
      reminder: {
        title: "授乳の時間です",
        body: "{{childName}}の授乳時間です。最後の授乳から{{hours}}時間が経ちました。",
      },
      overdue: {
        title: "授乳が遅れています",
        body: "{{childName}}の授乳が予定より遅れています。",
      },
    },
    sleep: {
      bedtime: {
        title: "就寝時間",
        body: "{{childName}}の就寝時間です。おやすみなさい！",
      },
      naptime: {
        title: "お昼寝の時間",
        body: "{{childName}}のお昼寝の時間です。",
      },
    },
    diaper: {
      reminder: {
        title: "おむつの確認",
        body: "{{childName}}のおむつを確認してください。",
      },
    },
    growth: {
      measurement: {
        title: "成長記録の時間",
        body: "{{childName}}の身長と体重を測定してみましょう。",
      },
    },
    milestone: {
      reminder: {
        title: "マイルストーン記録",
        body: "{{childName}}の新しい成長の瞬間を記録しましょう！",
      },
    },
    summary: {
      daily: {
        title: "今日の育児まとめ",
        body: "{{childName}}の1日の活動を確認してみましょう。",
      },
      weekly: {
        title: "週間育児レポート",
        body: "{{childName}}の今週の成長と活動を確認してみましょう。",
      },
    },
    reminder: {
      general: {
        title: "リマインダー",
        body: "{{message}}",
      },
    },
  },
} as const;

// 알림 서비스 클래스
export class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    });
  }

  // 푸시 토큰 등록/업데이트
  async registerPushToken(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web",
    deviceId?: string,
  ): Promise<void> {
    try {
      // Expo 푸시 토큰 유효성 검사
      if (!Expo.isExpoPushToken(token)) {
        throw new Error("Invalid Expo push token");
      }

      // 기존 토큰이 있는지 확인
      const { data: existingToken } = await supabase
        .from("push_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("token", token)
        .single();

      // TODO: zod/v4를 이용한 유효성 검사

      if (existingToken?.id) {
        // 기존 토큰 업데이트
        await supabase
          .from("push_tokens")
          .update({
            platform,
            device_id: deviceId,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingToken.id);
      } else {
        // 새 토큰 등록
        await supabase.from("push_tokens").insert({
          user_id: userId,
          token,
          platform,
          device_id: deviceId,
          is_active: true,
        });
      }

      logger.info(`Push token registered for user ${userId}`, {
        platform,
        deviceId,
      });
    } catch (error) {
      logger.error("Failed to register push token:", error);
      throw error;
    }
  }

  // 푸시 토큰 비활성화
  async deactivatePushToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from("push_tokens")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("token", token);

      logger.info(`Push token deactivated for user ${userId}`);
    } catch (error) {
      logger.error("Failed to deactivate push token:", error);
      throw error;
    }
  }

  // 사용자의 활성 푸시 토큰 가져오기
  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    try {
      const { data, error } = await supabase
        .from("push_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Failed to get user push tokens:", error);
      throw error;
    }
  }

  // 알림 설정 가져오기
  async getNotificationSettings(
    userId: string,
  ): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      logger.error("Failed to get notification settings:", error);
      throw error;
    }
  }

  // 알림 설정 업데이트
  async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>,
  ): Promise<void> {
    try {
      // 기존 설정이 있는지 확인
      const existing = await this.getNotificationSettings(userId);

      if (existing) {
        // 기존 설정 업데이트
        await supabase
          .from("notification_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        // 새 설정 생성
        await supabase.from("notification_settings").insert({
          user_id: userId,
          ...settings,
        });
      }

      logger.info(`Notification settings updated for user ${userId}`);
    } catch (error) {
      logger.error("Failed to update notification settings:", error);
      throw error;
    }
  }

  // 방해 금지 시간 체크
  private isQuietHours(settings: NotificationSettings): boolean {
    if (!settings?.quiet_hours?.enabled) return false;

    const now = new Date();
    const userTimezone = settings.timezone ?? "Asia/Seoul";

    // 사용자 시간대로 현재 시간 변환
    const userTime = new Date(
      now.toLocaleString("en-US", { timeZone: userTimezone }),
    );
    const currentTime = userTime.getHours() * 60 + userTime.getMinutes();

    const [startHour, startMin] = settings.quiet_hours.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = settings.quiet_hours.endTime
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

  // 템플릿에서 메시지 생성
  private generateMessage(
    templateKey: string,
    category: NotificationCategory,
    language: string,
    data: Record<string, unknown>,
  ): { title: string; body: string } {
    const templates =
      NOTIFICATION_TEMPLATES[language as keyof typeof NOTIFICATION_TEMPLATES] ||
      NOTIFICATION_TEMPLATES.ko;
    const categoryTemplates = templates[category];
    const template =
      categoryTemplates[templateKey as keyof typeof categoryTemplates];

    if (!template) {
      logger.warn(
        `Template not found: ${category}.${templateKey} for language ${language}`,
      );
      return {
        title: "알림",
        body: "새로운 알림이 있습니다.",
      };
    }

    // 템플릿 변수 치환
    let title = template.title;
    let body = template.body;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, "g"), String(value));
      body = body.replace(new RegExp(placeholder, "g"), String(value));
    });

    return { title, body };
  }

  // 즉시 알림 발송
  async sendImmediateNotification(
    userId: string,
    template: NotificationTemplate,
  ): Promise<void> {
    try {
      // 사용자 설정 확인
      const settings = await this.getNotificationSettings(userId);
      if (!settings?.enabled) {
        logger.info(`Notifications disabled for user ${userId}`);
        return;
      }

      // 카테고리별 설정 확인
      const categorySettings = settings.categories[template.category];
      if (!categorySettings.enabled) {
        logger.info(
          `Category ${template.category} disabled for user ${userId}`,
        );
        return;
      }

      // 방해 금지 시간 체크
      if (this.isQuietHours(settings)) {
        logger.info(`Quiet hours active for user ${userId}`);
        return;
      }

      // 푸시 토큰 가져오기
      const pushTokens = await this.getUserPushTokens(userId);
      if (pushTokens.length === 0) {
        logger.info(`No push tokens found for user ${userId}`);
        return;
      }

      // 메시지 생성
      const { title, body } = this.generateMessage(
        template.id,
        template.category,
        settings.language,
        template.data || {},
      );

      // 푸시 메시지 생성
      const messages: ExpoPushMessage[] = pushTokens.map((pushToken) => ({
        to: pushToken.token,
        title,
        body,
        data: {
          ...template.data,
          category: template.category,
          priority: template.priority,
        },
        categoryId: template.category,
        priority:
          template.priority === NotificationPriority.HIGH ? "high" : "normal",
        sound: categorySettings.sound ? "default" : undefined,
        badge: categorySettings.badge ? 1 : undefined,
      }));

      // 알림 발송
      const tickets = await this.expo.sendPushNotificationsAsync(messages);

      // 결과 로깅 및 히스토리 저장
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const token = pushTokens[i];

        if (ticket.status === "ok") {
          // 성공한 경우 히스토리 저장
          await supabase.from("notification_history").insert({
            user_id: userId,
            child_id: template.data?.childId as string,
            category: template.category,
            title,
            body,
            data: template.data || {},
            sent_at: new Date().toISOString(),
            status: "delivered",
            expo_ticket_id: ticket.id,
          });

          logger.info(`Notification sent successfully to ${token.token}`, {
            ticketId: ticket.id,
            category: template.category,
          });
        } else {
          // 실패한 경우
          logger.error(
            `Failed to send notification to ${token.token}:`,
            ticket.message,
          );

          await supabase.from("notification_history").insert({
            user_id: userId,
            child_id: template.data?.childId as string,
            category: template.category,
            title,
            body,
            data: template.data || {},
            sent_at: new Date().toISOString(),
            status: "failed",
          });
        }
      }
    } catch (error) {
      logger.error("Failed to send immediate notification:", error);
      throw error;
    }
  }

  // 예약 알림 생성
  async scheduleNotification(
    userId: string,
    childId: string | undefined,
    category: NotificationCategory,
    templateKey: string,
    templateData: Record<string, unknown>,
    scheduledAt: Date,
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .insert({
          user_id: userId,
          child_id: childId,
          category,
          template_key: templateKey,
          template_data: templateData,
          scheduled_at: scheduledAt.toISOString(),
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      logger.info(`Notification scheduled for user ${userId}`, {
        category,
        templateKey,
        scheduledAt: scheduledAt.toISOString(),
      });

      return data.id;
    } catch (error) {
      logger.error("Failed to schedule notification:", error);
      throw error;
    }
  }

  // 예약된 알림 취소
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await supabase
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", notificationId);

      logger.info(`Scheduled notification cancelled: ${notificationId}`);
    } catch (error) {
      logger.error("Failed to cancel scheduled notification:", error);
      throw error;
    }
  }

  // 대기 중인 예약 알림 가져오기
  async getPendingNotifications(): Promise<ScheduledNotification[]> {
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Failed to get pending notifications:", error);
      throw error;
    }
  }

  // 예약된 알림 처리
  async processScheduledNotification(
    notification: ScheduledNotification,
  ): Promise<void> {
    try {
      // 알림 발송
      await this.sendImmediateNotification(notification.user_id, {
        id: notification.template_key,
        category: notification.category,
        priority: NotificationPriority.MEDIUM,
        titleKey: notification.template_key,
        bodyKey: notification.template_key,
        data: notification.template_data,
      });

      // 상태 업데이트
      await supabase
        .from("scheduled_notifications")
        .update({
          status: "sent",
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", notification.id);

      logger.info(`Scheduled notification processed: ${notification.id}`);
    } catch (error) {
      // 실패한 경우 재시도 횟수 증가
      await supabase
        .from("scheduled_notifications")
        .update({
          status: "failed",
          attempts: notification.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", notification.id);

      logger.error(
        `Failed to process scheduled notification ${notification.id}:`,
        error,
      );
      throw error;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationService = new NotificationService();
