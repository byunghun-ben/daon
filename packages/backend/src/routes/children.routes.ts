import { Router } from "express";
import {
  createChild,
  getChildren,
  getChild,
  updateChild,
  deleteChild,
} from "../controllers/children.controller";
import { authenticateToken } from "../middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Child CRUD routes
router.post("/", createChild);
router.get("/", getChildren);
router.get("/:id", getChild);
router.put("/:id", updateChild);
router.delete("/:id", deleteChild);

export default router;