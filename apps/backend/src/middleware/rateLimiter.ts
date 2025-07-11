import type { RateLimitRequestHandler } from "express-rate-limit";
import { rateLimit } from "express-rate-limit";

// General rate limiter for all API endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip ?? req.socket.remoteAddress ?? "unknown";
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  message: "Upload limit exceeded, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI/Chat endpoints (more expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 AI requests per hour
  message: "AI request limit exceeded, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API endpoints (moderate restrictions)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a custom rate limiter with specific options
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message ?? "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
};
