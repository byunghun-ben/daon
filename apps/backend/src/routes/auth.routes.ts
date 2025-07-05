import {
  checkRegistrationStatus,
  createChild,
  getProfile,
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
router.post("/signup", authLimiter, signUp);
router.post("/signin", authLimiter, signIn);

// Kakao OAuth routes with auth rate limiting
router.post("/kakao/url", authLimiter, kakaoAuthController.generateLoginUrl);
router.get("/kakao/callback", authLimiter, kakaoAuthController.handleCallback);
router.post("/kakao/sdk", authLimiter, kakaoAuthController.handleSdkLogin);

// Protected routes
router.post("/signout", authenticateToken, signOut);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post("/check-registration", authenticateToken, checkRegistrationStatus);

// Child management routes (Step 2 of registration)
router.post("/create-child", authenticateToken, createChild);

export default router;
