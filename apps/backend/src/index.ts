// Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { generalLimiter } from "@/middleware/rateLimiter.js";
import apiRoutes from "@/routes/index.js";
import { notificationScheduler } from "@/services/notification-scheduler.service.js";
import { logger } from "@/utils/logger.js";
import cors from "cors";
import type { Express } from "express";
import express from "express";
import helmet from "helmet";

const app: Express = express();
const PORT = process.env.PORT ?? 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Daon API Server",
    version: "1.0.0",
    docs: "/api/v1/docs",
  });
});

// API routes
app.use("/api/v1", apiRoutes);

// Extended Error interface with status property
interface HttpError extends Error {
  status?: number;
}

// Global error handler
app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("Unhandled error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.status ?? 500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  },
);

// 404 handler
app.use("/*splat", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV ?? "development"}`);
  logger.info(
    `CORS Origin: ${process.env.CORS_ORIGIN ?? "http://localhost:3000"}`,
  );

  // 알림 스케줄러 시작
  try {
    notificationScheduler.start();
    logger.info("Notification scheduler initialized");
  } catch (error) {
    logger.error("Failed to start notification scheduler:", error);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  notificationScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  notificationScheduler.stop();
  process.exit(0);
});

export default app;
