import { Router } from "express";
import authRoutes from "./auth.routes";
import childrenRoutes from "./children.routes";
import guardiansRoutes from "./guardians.routes";
import activitiesRoutes from "./activities.routes";
import growthRoutes from "./growth.routes";
import diaryRoutes from "./diary.routes";

const router = Router();

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Daon API v1",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /auth/signup": "Create new user account",
        "POST /auth/signin": "Sign in user",
        "POST /auth/signout": "Sign out user (requires auth)",
        "GET /auth/profile": "Get user profile (requires auth)",
        "PUT /auth/profile": "Update user profile (requires auth)",
      },
      children: {
        "POST /children": "Create child profile (requires auth)",
        "GET /children": "Get all children for user (requires auth)",
        "GET /children/:id": "Get specific child (requires auth)",
        "PUT /children/:id": "Update child profile (requires auth)",
        "DELETE /children/:id": "Delete child profile (requires auth)",
      },
      guardians: {
        "POST /guardians/children/:child_id/invite": "Invite guardian (requires auth)",
        "GET /guardians/children/:child_id/guardians": "Get child guardians (requires auth)",
        "DELETE /guardians/children/:child_id/guardians/:guardian_id": "Remove guardian (requires auth)",
        "POST /guardians/accept-invitation": "Accept guardian invitation (requires auth)",
        "GET /guardians/pending-invitations": "Get pending invitations (requires auth)",
      },
      activities: {
        "POST /activities": "Create activity record (requires auth)",
        "GET /activities": "Get activities with filters (requires auth)",
        "GET /activities/:id": "Get specific activity (requires auth)",
        "PUT /activities/:id": "Update activity record (requires auth)",
        "DELETE /activities/:id": "Delete activity record (requires auth)",
        "GET /activities/summary/:child_id": "Get activity summary for child (requires auth)",
      },
      growth: {
        "POST /growth": "Create growth record (requires auth)",
        "GET /growth": "Get growth records with filters (requires auth)",
        "GET /growth/:id": "Get specific growth record (requires auth)",
        "PUT /growth/:id": "Update growth record (requires auth)",
        "DELETE /growth/:id": "Delete growth record (requires auth)",
        "GET /growth/chart/:child_id": "Get growth chart data for child (requires auth)",
      },
      diary: {
        "POST /diary": "Create diary entry (requires auth)",
        "GET /diary": "Get diary entries with filters (requires auth)",
        "GET /diary/:id": "Get specific diary entry (requires auth)",
        "PUT /diary/:id": "Update diary entry (requires auth)",
        "DELETE /diary/:id": "Delete diary entry (requires auth)",
        "POST /diary/milestones": "Add milestone (requires auth)",
      },
    },
  });
});

// Mount route handlers
router.use("/auth", authRoutes);
router.use("/children", childrenRoutes);
router.use("/guardians", guardiansRoutes);
router.use("/activities", activitiesRoutes);
router.use("/growth", growthRoutes);
router.use("/diary", diaryRoutes);

export default router;