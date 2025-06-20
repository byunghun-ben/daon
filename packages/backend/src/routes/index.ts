import { Router } from "express";
import authRoutes from "./auth.routes";
import childrenRoutes from "./children.routes";
import guardiansRoutes from "./guardians.routes";

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
    },
  });
});

// Mount route handlers
router.use("/auth", authRoutes);
router.use("/children", childrenRoutes);
router.use("/guardians", guardiansRoutes);

export default router;