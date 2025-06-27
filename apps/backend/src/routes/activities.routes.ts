import { Router } from "express";
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getActivitySummary,
} from "../controllers/activities.controller";
import { authenticateToken } from "../middleware/auth";

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