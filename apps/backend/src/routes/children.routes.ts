import {
  createChild,
  deleteChild,
  getChild,
  getChildren,
  joinChild,
  updateChild,
} from "@/controllers/children.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Child CRUD routes
router.post("/", createChild);
router.get("/", getChildren);
router.get("/:id", getChild);
router.put("/:id", updateChild);
router.delete("/:id", deleteChild);

// Join existing child by invite code
router.post("/join", joinChild);

export default router;
