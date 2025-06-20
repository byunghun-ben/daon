import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { logger } from "../utils/logger";

// User type definition
export interface User {
  id: string;
  email: string;
  role?: string;
}

// Base request interface with optional user (for middleware)
interface BaseRequest extends Request {
  user?: User;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Middleware to verify JWT token from Supabase Auth
 */
export async function authenticateToken(
  req: BaseRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn("Invalid token provided", { error: error?.message });
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email || "",
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Type guard to check if request has authenticated user
 */
export function isAuthenticatedRequest(
  req: BaseRequest
): req is AuthenticatedRequest {
  return req.user !== undefined;
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(
  req: BaseRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email || "",
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    logger.error("Optional auth middleware error:", error);
    next(); // Continue without auth
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(role: string) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
