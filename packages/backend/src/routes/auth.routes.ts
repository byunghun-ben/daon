import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  getProfile,
  updateProfile,
  createChild,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";

const router: Router = Router();

// Public routes
router.post("/signup", signUp);
router.post("/signin", signIn);

// Protected routes
router.post("/signout", authenticateToken, signOut);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

// Child management routes (Step 2 of registration)
router.post("/create-child", authenticateToken, createChild);

export default router;
