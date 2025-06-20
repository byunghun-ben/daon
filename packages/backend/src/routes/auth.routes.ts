import { Router } from "express";
import { 
  signUp, 
  signIn, 
  signOut, 
  getProfile, 
  updateProfile 
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/signup", signUp);
router.post("/signin", signIn);

// Protected routes
router.post("/signout", authenticateToken, signOut);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

export default router;