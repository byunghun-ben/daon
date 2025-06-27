import { Router } from "express";
import {
  createChild,
  getChildren,
  getChild,
  updateChild,
  deleteChild,
  joinChild,
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

// Join existing child by invite code
router.post("/join", joinChild);

export default router;
