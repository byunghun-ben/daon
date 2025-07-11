import {
  registerToken,
  unregisterToken,
  getUserTokens,
  sendNotification,
  sendTopicNotification,
} from "@/controllers/notifications.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// FCM token management routes
router.post("/register", registerToken);
router.delete("/unregister", unregisterToken);
router.get("/tokens", getUserTokens);

// Notification sending routes
router.post("/send", sendNotification);
router.post("/send-to-topic", sendTopicNotification);

export default router;