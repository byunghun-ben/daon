import {
  checkRegistrationStatus,
  createChild,
  getProfile,
  refreshToken,
  signIn,
  signOut,
  signUp,
  updateProfile,
} from "@/controllers/auth.controller.js";
import { KakaoAuthController } from "@/controllers/kakao-auth.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { authLimiter } from "@/middleware/rateLimiter.js";
import { Router } from "express";

const router: Router = Router();
const kakaoAuthController = new KakaoAuthController();

// Public routes with auth rate limiting
// @ts-expect-error - express-rate-limit types are not compatible with express types
router.post("/signup", authLimiter, signUp);

// @ts-expect-error - express-rate-limit types are not compatible with express types
router.post("/signin", authLimiter, signIn);

// @ts-expect-error - express-rate-limit types are not compatible with express types
router.post("/refresh", authLimiter, refreshToken);

// Kakao OAuth routes with auth rate limiting
// @ts-expect-error - express-rate-limit types are not compatible with express types
router.post("/kakao/url", authLimiter, kakaoAuthController.generateLoginUrl);

// @ts-expect-error - express-rate-limit types are not compatible with express types
router.get("/kakao/callback", authLimiter, kakaoAuthController.handleCallback);

// Protected routes
router.post("/signout", authenticateToken, signOut);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/check-registration", authenticateToken, checkRegistrationStatus);

// Child management routes (Step 2 of registration)
router.post("/create-child", authenticateToken, createChild);

export default router;
