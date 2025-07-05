import { logger } from "@/utils/logger.js";
import type { NextFunction, Request, Response } from "express";

// Sensitive fields that should not be logged
const SENSITIVE_FIELDS = [
  "password",
  "accessToken",
  "refreshToken",
  "access_token",
  "refresh_token",
  "token",
  "authorization",
];

// Function to mask sensitive data
function maskSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveData(item));
  }

  const masked = { ...obj } as Record<string, unknown>;

  for (const key in masked) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field))) {
      masked[key] = "[REDACTED]";
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request
  logger.info(`[${requestId}] ${req.method} ${req.path} - Request`, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: maskSensitiveData(req.body),
    headers: {
      "user-agent": req.get("User-Agent"),
      "content-type": req.get("Content-Type"),
      host: req.get("Host"),
    },
    ip: req.ip,
  });

  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Track response data
  let responseBody: unknown;

  // Override send method
  res.send = function (data: unknown) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Override json method
  res.json = function (data: unknown) {
    responseBody = data;
    return originalJson.call(this, data);
  };

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? "error" : "info";

    logger[logLevel](`[${requestId}] ${req.method} ${req.path} - Response`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      responseBody: maskSensitiveData(responseBody),
    });
  });

  // Log errors
  res.on("error", (error) => {
    const duration = Date.now() - startTime;
    logger.error(`[${requestId}] ${req.method} ${req.path} - Error`, {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
    });
  });

  next();
};
