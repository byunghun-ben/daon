import { supabase } from "@/lib/supabase.js";
import type { AuthenticatedRequest } from "@/middleware/auth.js";
import {
  NotificationCategory,
  NotificationPriority,
  notificationService,
} from "@/services/notification.service.js";
import { logger } from "@/utils/logger.js";
import type { Response } from "express";

// 푸시 토큰 등록
export const registerPushToken = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { token, platform, deviceId } = req.body;
    // TODO: zod/v4를 이용한 유효성 검사

    if (!token || !platform) {
      return res.status(400).json({ error: "Token and platform are required" });
    }

    if (!["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({ error: "Invalid platform" });
    }

    await notificationService.registerPushToken(
      userId,
      token,
      platform,
      deviceId,
    );

    res.status(200).json({ message: "Push token registered successfully" });
  } catch (error) {
    logger.error("Error registering push token:", error);
    res.status(500).json({ error: "Failed to register push token" });
  }
};

// 푸시 토큰 비활성화
export const deactivatePushToken = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const { token } = req.body;
    // TODO: zod/v4를 이용한 유효성 검사

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    await notificationService.deactivatePushToken(userId, token);

    res.status(200).json({ message: "Push token deactivated successfully" });
  } catch (error) {
    logger.error("Error deactivating push token:", error);
    res.status(500).json({ error: "Failed to deactivate push token" });
  }
};

// 알림 설정 조회
export const getNotificationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const settings = await notificationService.getNotificationSettings(userId);

    if (!settings) {
      // 기본 설정 반환
      return res.status(200).json({
        settings: {
          enabled: true,
          categories: {
            feeding: {
              enabled: true,
              sound: true,
              vibration: true,
              badge: true,
            },
            sleep: { enabled: true, sound: true, vibration: true, badge: true },
            diaper: {
              enabled: true,
              sound: false,
              vibration: true,
              badge: true,
            },
            growth: {
              enabled: true,
              sound: false,
              vibration: false,
              badge: true,
            },
            milestone: {
              enabled: true,
              sound: true,
              vibration: true,
              badge: true,
            },
            summary: {
              enabled: true,
              sound: false,
              vibration: false,
              badge: true,
            },
            reminder: {
              enabled: true,
              sound: true,
              vibration: true,
              badge: true,
            },
          },
          quiet_hours: {
            enabled: false,
            startTime: "22:00",
            endTime: "07:00",
          },
          frequency: {
            feeding: 3,
            sleep: 2,
            dailySummary: "20:00",
            weeklyReport: 0,
          },
          language: "ko",
          timezone: "Asia/Seoul",
        },
      });
    }

    res.status(200).json({ settings });
  } catch (error) {
    logger.error("Error getting notification settings:", error);
    res.status(500).json({ error: "Failed to get notification settings" });
  }
};

// 알림 설정 업데이트
export const updateNotificationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const settings = req.body;
    // TODO: zod/v4를 이용한 유효성 검사

    // 기본 유효성 검사
    if (
      settings.enabled !== undefined &&
      typeof settings.enabled !== "boolean"
    ) {
      return res.status(400).json({ error: "Invalid enabled value" });
    }

    if (settings.language && !["ko", "en", "ja"].includes(settings.language)) {
      return res.status(400).json({ error: "Invalid language" });
    }

    await notificationService.updateNotificationSettings(userId, settings);

    res
      .status(200)
      .json({ message: "Notification settings updated successfully" });
  } catch (error) {
    logger.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
};

// 즉시 알림 발송
export const sendImmediateNotification = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const { category, templateKey, data, priority } = req.body;
    // TODO: zod/v4를 이용한 유효성 검사

    if (!category || !templateKey) {
      return res
        .status(400)
        .json({ error: "Category and templateKey are required" });
    }

    if (!Object.values(NotificationCategory).includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const notificationPriority = priority || NotificationPriority.MEDIUM;
    if (!Object.values(NotificationPriority).includes(notificationPriority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    await notificationService.sendImmediateNotification(userId, {
      id: templateKey,
      category,
      priority: notificationPriority,
      titleKey: templateKey,
      bodyKey: templateKey,
      data: data || {},
    });

    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    logger.error("Error sending immediate notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

// 알림 예약
export const scheduleNotification = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const { childId, category, templateKey, data, scheduledAt } = req.body;
    // TODO: zod/v4를 이용한 유효성 검사

    if (!category || !templateKey || !scheduledAt) {
      return res
        .status(400)
        .json({ error: "Category, templateKey, and scheduledAt are required" });
    }

    if (!Object.values(NotificationCategory).includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ error: "Invalid scheduledAt date" });
    }

    const notificationId = await notificationService.scheduleNotification(
      userId,
      childId,
      category,
      templateKey,
      data || {},
      scheduledDate,
    );

    res.status(201).json({
      message: "Notification scheduled successfully",
      notificationId,
    });
  } catch (error) {
    logger.error("Error scheduling notification:", error);
    res.status(500).json({ error: "Failed to schedule notification" });
  }
};

// 예약된 알림 취소
export const cancelScheduledNotification = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    // const userId = req.user.id;

    const { notificationId } = req.params;
    // TODO: zod/v4를 이용한 유효성 검사

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    await notificationService.cancelScheduledNotification(notificationId);

    res
      .status(200)
      .json({ message: "Scheduled notification cancelled successfully" });
  } catch (error) {
    logger.error("Error cancelling scheduled notification:", error);
    res.status(500).json({ error: "Failed to cancel scheduled notification" });
  }
};

// 알림 히스토리 조회
export const getNotificationHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const { page = 1, limit = 20, category, childId } = req.query;
    // TODO: zod/v4를 이용한 유효성 검사
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("notification_history")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (category) {
      query = query.eq("category", category);
    }

    if (childId) {
      query = query.eq("child_id", childId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      history: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error getting notification history:", error);
    res.status(500).json({ error: "Failed to get notification history" });
  }
};

// 테스트 알림 발송
export const sendTestNotification = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    await notificationService.sendImmediateNotification(userId, {
      id: "general",
      category: NotificationCategory.REMINDER,
      priority: NotificationPriority.MEDIUM,
      titleKey: "general",
      bodyKey: "general",
      data: {
        message:
          "테스트 알림입니다. 알림 시스템이 정상적으로 작동하고 있습니다.",
      },
    });

    res.status(200).json({ message: "Test notification sent successfully" });
  } catch (error) {
    logger.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send test notification" });
  }
};
