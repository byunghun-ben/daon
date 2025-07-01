import { chatController } from "@/controllers/chat.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// POST /api/v1/chat/stream - Stream chat response
router.post("/stream", chatController.streamChat);

// GET /api/v1/chat/health - Chat service health check
router.get("/health", chatController.healthCheck);

// GET /api/v1/chat/models - Get available AI models
router.get("/models", chatController.getModels);

export default router;
