import * as notificationsController from "@/controllers/notifications.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { apiLimiter } from "@/middleware/rateLimiter.js";
import express from "express";

const router = express.Router();

// 모든 알림 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 푸시 토큰 관리
router.post("/tokens", apiLimiter, notificationsController.registerPushToken);
router.delete(
  "/tokens",
  apiLimiter,
  notificationsController.deactivatePushToken,
);

// 알림 설정
router.get("/settings", notificationsController.getNotificationSettings);
router.put(
  "/settings",
  apiLimiter,
  notificationsController.updateNotificationSettings,
);

// 알림 발송
router.post(
  "/send",
  apiLimiter,
  notificationsController.sendImmediateNotification,
);
router.post(
  "/schedule",
  apiLimiter,
  notificationsController.scheduleNotification,
);
router.delete(
  "/schedule/:notificationId",
  apiLimiter,
  notificationsController.cancelScheduledNotification,
);

// 알림 히스토리
router.get("/history", notificationsController.getNotificationHistory);

// 테스트 알림
router.post("/test", apiLimiter, notificationsController.sendTestNotification);

export default router;
