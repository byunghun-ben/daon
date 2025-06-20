import { Router } from "express";
import {
  createGrowthRecord,
  getGrowthRecords,
  getGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  getGrowthChart,
} from "../controllers/growth.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Growth record CRUD routes
router.post("/", createGrowthRecord);
router.get("/", getGrowthRecords);
router.get("/:id", getGrowthRecord);
router.put("/:id", updateGrowthRecord);
router.delete("/:id", deleteGrowthRecord);

// Growth chart data route
router.get("/chart/:child_id", getGrowthChart);

export default router;