// Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { generalLimiter } from "@/middleware/rateLimiter.js";
import { requestLogger } from "@/middleware/requestLogger.js";
import apiRoutes from "@/routes/index.js";
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
const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [
      "http://localhost:3000",
    ];
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Enhanced request and response logging
app.use(requestLogger);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (_req, res) => {
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
    _req: express.Request,
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
app.use("/*splat", (_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV ?? "development"}`);
  logger.info(
    `CORS Origin: ${process.env.CORS_ORIGIN ?? "http://localhost:3000"}`,
  );
});

export default app;
