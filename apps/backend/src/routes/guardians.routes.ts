import {
  acceptInvitation,
  getGuardians,
  getPendingInvitations,
  inviteGuardian,
  removeGuardian,
} from "@/controllers/guardians.controller.js";
import { authenticateToken } from "@/middleware/auth.js";
import { Router } from "express";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Guardian invitation routes
router.post("/children/:child_id/invite", inviteGuardian);
router.get("/children/:child_id/guardians", getGuardians);
router.delete("/children/:child_id/guardians/:guardian_id", removeGuardian);

// User invitation routes
router.post("/accept-invitation", acceptInvitation);
router.get("/pending-invitations", getPendingInvitations);

export default router;
