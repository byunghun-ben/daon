import { supabase } from "@/lib/supabase.js";
import {
  NotificationCategory,
  NotificationPriority,
  notificationService,
} from "@/services/notification.service.js";
import { logger } from "@/utils/logger.js";
import cron from "node-cron";

// 알림 스케줄러 서비스
export class NotificationSchedulerService {
  private isRunning = false;

  // 스케줄러 시작
  start(): void {
    if (this.isRunning) {
      logger.warn("Notification scheduler is already running");
      return;
    }

    logger.info("Starting notification scheduler");

    // 매분마다 대기 중인 알림 처리
    cron.schedule("* * * * *", async () => {
      try {
        await this.processPendingNotifications();
      } catch (error) {
        logger.error("Error processing pending notifications:", error);
      }
    });

    // 매일 오전 9시에 일일 요약 알림 스케줄링
    cron.schedule("0 9 * * *", async () => {
      try {
        await this.scheduleDailySummaryNotifications();
      } catch (error) {
        logger.error("Error scheduling daily summary notifications:", error);
      }
    });

    // 매주 일요일 오전 10시에 주간 리포트 알림 스케줄링
    cron.schedule("0 10 * * 0", async () => {
      try {
        await this.scheduleWeeklyReportNotifications();
      } catch (error) {
        logger.error("Error scheduling weekly report notifications:", error);
      }
    });

    // 매 시간마다 수유/수면 리마인더 확인
    cron.schedule("0 * * * *", async () => {
      try {
        await this.checkFeedingReminders();
        await this.checkSleepReminders();
      } catch (error) {
        logger.error("Error checking reminders:", error);
      }
    });

    this.isRunning = true;
    logger.info("Notification scheduler started successfully");
  }

  // 스케줄러 중지
  stop(): void {
    if (!this.isRunning) {
      logger.warn("Notification scheduler is not running");
      return;
    }

    // 모든 cron 작업 중지
    cron.getTasks().forEach((task) => {
      void task.stop();
    });

    this.isRunning = false;
    logger.info("Notification scheduler stopped");
  }

  // 대기 중인 알림 처리
  private async processPendingNotifications(): Promise<void> {
    try {
      const pendingNotifications =
        await notificationService.getPendingNotifications();

      if (pendingNotifications.length === 0) {
        return;
      }

      logger.info(
        `Processing ${pendingNotifications.length} pending notifications`,
      );

      for (const notification of pendingNotifications) {
        try {
          await notificationService.processScheduledNotification(notification);
        } catch (error) {
          logger.error(
            `Failed to process notification ${notification.id}:`,
            error,
          );
          // 개별 알림 실패는 전체 처리를 중단하지 않음
        }
      }
    } catch (error) {
      logger.error("Error getting pending notifications:", error);
    }
  }

  // 일일 요약 알림 스케줄링
  private async scheduleDailySummaryNotifications(): Promise<void> {
    try {
      // 일일 요약 알림이 활성화된 사용자들 조회
      const { data: users, error } = await supabase
        .from("notification_settings")
        .select("user_id, categories, frequency, timezone")
        .eq("enabled", true)
        .contains("categories", { summary: { enabled: true } });

      // TODO: zod/v4를 이용한 유효성 검사

      if (error) throw error;

      for (const user of users || []) {
        try {
          const summaryTime = user.frequency?.dailySummary ?? "20:00";
          const [hour, minute] = summaryTime.split(":").map(Number);

          // 사용자 시간대에 맞춰 오늘 저녁 시간 계산
          const scheduledAt = new Date();
          scheduledAt.setHours(hour, minute, 0, 0);

          // 이미 지난 시간이면 내일로 설정
          if (scheduledAt <= new Date()) {
            scheduledAt.setDate(scheduledAt.getDate() + 1);
          }

          await notificationService.scheduleNotification(
            user.user_id,
            undefined,
            NotificationCategory.SUMMARY,
            "daily",
            {},
            scheduledAt,
          );

          logger.info(
            `Daily summary notification scheduled for user ${user.user_id}`,
          );
        } catch (error) {
          logger.error(
            `Failed to schedule daily summary for user ${user.user_id}:`,
            error,
          );
        }
      }
    } catch (error) {
      logger.error("Error scheduling daily summary notifications:", error);
    }
  }

  // 주간 리포트 알림 스케줄링
  private async scheduleWeeklyReportNotifications(): Promise<void> {
    try {
      // 주간 리포트 알림이 활성화된 사용자들 조회
      const { data: users, error } = await supabase
        .from("notification_settings")
        .select("user_id, categories, frequency, timezone")
        .eq("enabled", true)
        .contains("categories", { summary: { enabled: true } });

      // TODO: zod/v4를 이용한 유효성 검사

      if (error) throw error;

      for (const user of users || []) {
        try {
          const weeklyDay = user.frequency?.weeklyReport ?? 0; // 0 = 일요일

          // 다음 주간 리포트 일정 계산
          const scheduledAt = new Date();
          scheduledAt.setDate(
            scheduledAt.getDate() +
              ((7 - scheduledAt.getDay() + weeklyDay) % 7),
          );
          scheduledAt.setHours(10, 0, 0, 0);

          await notificationService.scheduleNotification(
            user.user_id,
            undefined,
            NotificationCategory.SUMMARY,
            "weekly",
            {},
            scheduledAt,
          );

          logger.info(
            `Weekly report notification scheduled for user ${user.user_id}`,
          );
        } catch (error) {
          logger.error(
            `Failed to schedule weekly report for user ${user.user_id}:`,
            error,
          );
        }
      }
    } catch (error) {
      logger.error("Error scheduling weekly report notifications:", error);
    }
  }

  // 수유 리마인더 확인
  private async checkFeedingReminders(): Promise<void> {
    try {
      // 수유 리마인더가 활성화된 사용자들과 최근 수유 기록 조회
      const { data: usersWithRecentFeeding, error } = await supabase
        .from("notification_settings")
        .select(
          `
          user_id,
          frequency,
          timezone,
          children!inner(id, name),
          activities!inner(
            child_id,
            activity_type,
            created_at
          )
        `,
        )
        .eq("enabled", true)
        .contains("categories", { feeding: { enabled: true } })
        .eq("activities.activity_type", "feeding")
        .gte(
          "activities.created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      // TODO: zod/v4를 이용한 유효성 검사

      if (error) throw error;

      for (const user of usersWithRecentFeeding || []) {
        try {
          const feedingInterval = user.frequency?.feeding ?? 3; // 기본 3시간
          const lastFeedingTime = new Date(user.activities.created_at);
          const nextFeedingTime = new Date(
            lastFeedingTime.getTime() + feedingInterval * 60 * 60 * 1000,
          );

          // 다음 수유 시간이 지났고, 아직 알림을 보내지 않았다면
          if (nextFeedingTime <= new Date()) {
            const hoursOverdue = Math.floor(
              (Date.now() - nextFeedingTime.getTime()) / (60 * 60 * 1000),
            );

            await notificationService.sendImmediateNotification(user.user_id, {
              id: "reminder",
              category: NotificationCategory.FEEDING,
              priority: NotificationPriority.HIGH,
              titleKey: "reminder",
              bodyKey: "reminder",
              data: {
                childName: user.children.name,
                hours: feedingInterval + hoursOverdue,
                childId: user.children.id,
              },
            });
          }
        } catch (error) {
          logger.error(
            `Failed to check feeding reminder for user ${user.user_id}:`,
            error,
          );
        }
      }
    } catch (error) {
      logger.error("Error checking feeding reminders:", error);
    }
  }

  // 수면 리마인더 확인
  private async checkSleepReminders(): Promise<void> {
    try {
      // 수면 리마인더가 활성화된 사용자들과 최근 수면 기록 조회
      const { data: usersWithRecentSleep, error } = await supabase
        .from("notification_settings")
        .select(
          `
          user_id,
          frequency,
          timezone,
          children!inner(id, name),
          activities!inner(
            child_id,
            activity_type,
            created_at,
            end_time
          )
        `,
        )
        .eq("enabled", true)
        .contains("categories", { sleep: { enabled: true } })
        .eq("activities.activity_type", "sleep")
        .not("activities.end_time", "is", null)
        .gte(
          "activities.created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      // TODO: zod/v4를 이용한 유효성 검사

      if (error) throw error;

      for (const user of usersWithRecentSleep || []) {
        try {
          const sleepInterval = user.frequency?.sleep ?? 2; // 기본 2시간
          const lastWakeupTime = new Date(user.activities.end_time);
          const nextSleepTime = new Date(
            lastWakeupTime.getTime() + sleepInterval * 60 * 60 * 1000,
          );

          // 다음 수면 시간이 지났고, 아직 알림을 보내지 않았다면
          if (nextSleepTime <= new Date()) {
            const templateKey =
              new Date().getHours() < 18 ? "naptime" : "bedtime";

            await notificationService.sendImmediateNotification(user.user_id, {
              id: templateKey,
              category: NotificationCategory.SLEEP,
              priority: NotificationPriority.MEDIUM,
              titleKey: templateKey,
              bodyKey: templateKey,
              data: {
                childName: user.children.name,
                childId: user.children.id,
              },
            });
          }
        } catch (error) {
          logger.error(
            `Failed to check sleep reminder for user ${user.user_id}:`,
            error,
          );
        }
      }
    } catch (error) {
      logger.error("Error checking sleep reminders:", error);
    }
  }

  // 상태 확인
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationScheduler = new NotificationSchedulerService();
