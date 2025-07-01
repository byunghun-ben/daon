import {
  isAuthenticatedRequest,
  type AuthenticatedRequest,
} from "@/middleware/auth.js";
import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";

/**
 * Wrapper function to create authenticated handlers
 * Automatically checks if request is authenticated and provides typed req.user
 */
export function createAuthenticatedHandler(
  handler: (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Now req is typed as AuthenticatedRequest
    await handler(req, res, next);
  };
}
