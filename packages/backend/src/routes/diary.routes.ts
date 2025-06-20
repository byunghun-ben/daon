import { Router } from "express";
import {
  createDiaryEntry,
  getDiaryEntries,
  getDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  addMilestone,
} from "../controllers/diary.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

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