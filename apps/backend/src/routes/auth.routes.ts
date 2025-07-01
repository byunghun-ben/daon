import {
  createChild,
  getProfile,
  signIn,
  signOut,
  signUp,
  updateProfile,
} from "@/controllers/auth.controller.js";
import { KakaoAuthController } from "@/controllers/kakao-auth.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();
const kakaoAuthController = new KakaoAuthController();

// Public routes
router.post("/signup", signUp);
router.post("/signin", signIn);

// Kakao OAuth routes
router.post("/kakao/url", kakaoAuthController.generateLoginUrl);
router.get("/kakao/callback", kakaoAuthController.handleCallback);

// Protected routes
router.post("/signout", authenticateToken, signOut);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Child management routes (Step 2 of registration)
router.post("/create-child", authenticateToken, createChild);

export default router;
