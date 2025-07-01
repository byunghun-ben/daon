import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivity,
  getActivitySummary,
  updateActivity,
} from "@/controllers/activities.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Activity CRUD routes
router.post("/", createActivity);
router.get("/", getActivities);
router.get("/:id", getActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

// Activity summary route
router.get("/summary/:child_id", getActivitySummary);

export default router;
