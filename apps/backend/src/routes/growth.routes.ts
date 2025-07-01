import {
  createGrowthRecord,
  deleteGrowthRecord,
  getGrowthChart,
  getGrowthRecord,
  getGrowthRecords,
  updateGrowthRecord,
} from "@/controllers/growth.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();

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
