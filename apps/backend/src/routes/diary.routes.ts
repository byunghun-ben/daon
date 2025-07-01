import {
  addMilestone,
  createDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntries,
  getDiaryEntry,
  updateDiaryEntry,
} from "@/controllers/diary.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Diary entry CRUD routes
router.post("/", createDiaryEntry);
router.get("/", getDiaryEntries);
router.get("/:id", getDiaryEntry);
router.put("/:id", updateDiaryEntry);
router.delete("/:id", deleteDiaryEntry);

// Milestone routes
router.post("/milestones", addMilestone);

export default router;
