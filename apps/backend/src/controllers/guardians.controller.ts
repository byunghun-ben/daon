import { supabaseAdmin } from "@/lib/supabase.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import { z } from "zod/v4";

// Zod schemas for validation
const InviteGuardianSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["guardian", "viewer"]).default("guardian"),
});

const AcceptInvitationSchema = z.object({
  invitation_id: z.string().uuid("Invalid invitation ID"),
});

/**
 * Invite a guardian for a child
 */
export const inviteGuardian = createAuthenticatedHandler(async (req, res) => {
  try {
    const { child_id } = req.params;
    const validatedData = InviteGuardianSchema.parse(req.body);

    // Check if user owns this child
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .select("owner_id")
      .eq("id", child_id)
      .single();

    if (childError || !child) {
      res.status(404).json({ error: "Child not found" });
      return;
    }

    if (child.owner_id !== req.user.id) {
      res
        .status(403)
        .json({ error: "Only the child owner can invite guardians" });
      return;
    }

    // Check if invited user exists
    const { data: invitedUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("email", validatedData.email)
      .single();

    if (userError || !invitedUser) {
      res.status(404).json({ error: "User with this email not found" });
      return;
    }

    // Check if user is trying to invite themselves
    if (invitedUser.id === req.user.id) {
      res.status(400).json({ error: "Cannot invite yourself" });
      return;
    }

    // Check if guardian relationship already exists
    const { data: existingGuardian, error: existingError } = await supabaseAdmin
      .from("child_guardians")
      .select("id, accepted_at")
      .eq("child_id", child_id)
      .eq("user_id", invitedUser.id)
      .single();

    if (existingError) {
      logger.error("Failed to check existing guardian", {
        childId: child_id,
        invitedUserId: invitedUser.id,
        userId: req.user.id,
        error: existingError,
      });
      res.status(500).json({ error: "Failed to check existing guardian" });
      return;
    }

    if (existingGuardian?.accepted_at) {
      res
        .status(400)
        .json({ error: "User is already a guardian for this child" });
      return;
    }

    if (existingGuardian && !existingGuardian.accepted_at) {
      res.status(400).json({ error: "Invitation already sent to this user" });
      return;
    }

    // Create guardian invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("child_guardians")
      .insert({
        child_id,
        user_id: invitedUser.id,
        role: validatedData.role,
      })
      .select(
        `
        *,
        users(name, email),
        children(name)
      `,
      )
      .single();

    if (invitationError) {
      logger.error("Failed to create guardian invitation", {
        childId: child_id,
        invitedUserId: invitedUser.id,
        userId: req.user.id,
        error: invitationError,
      });
      res.status(500).json({ error: "Failed to send invitation" });
      return;
    }

    logger.info("Guardian invitation sent", {
      childId: child_id,
      invitedUserId: invitedUser.id,
      userId: req.user.id,
    });

    // TODO: Send email notification to invited user

    res.status(201).json({
      message: "Guardian invitation sent successfully",
      invitation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Invite guardian error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get all guardians for a child
 */
export const getGuardians = createAuthenticatedHandler(async (req, res) => {
  try {
    const { child_id } = req.params;

    // Check if user has access to this child
    const { data: access, error: accessError } = await supabaseAdmin
      .from("child_guardians")
      .select("role")
      .eq("child_id", child_id)
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null)
      .single();

    if (accessError || !access) {
      res.status(404).json({ error: "Child not found or access denied" });
      return;
    }

    const { data: guardians, error } = await supabaseAdmin
      .from("child_guardians")
      .select(
        `
        *,
        users(id, name, email, avatar_url)
      `,
      )
      .eq("child_id", child_id)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Failed to get guardians", {
        childId: child_id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to get guardians" });
      return;
    }

    res.json({ guardians });
  } catch (error) {
    logger.error("Get guardians error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Accept guardian invitation
 */
export const acceptInvitation = createAuthenticatedHandler(async (req, res) => {
  try {
    const validatedData = AcceptInvitationSchema.parse(req.body);

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("child_guardians")
      .select(
        `
        *,
        children(name, owner_id),
        users(name, email)
      `,
      )
      .eq("id", validatedData.invitation_id)
      .eq("user_id", req.user.id)
      .is("accepted_at", null)
      .single();

    if (invitationError || !invitation) {
      res
        .status(404)
        .json({ error: "Invitation not found or already accepted" });
      return;
    }

    // Accept the invitation
    const { data: acceptedInvitation, error: acceptError } = await supabaseAdmin
      .from("child_guardians")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", validatedData.invitation_id)
      .select(
        `
        *,
        children(name),
        users(name, email)
      `,
      )
      .single();

    if (acceptError) {
      logger.error("Failed to accept invitation", {
        invitationId: validatedData.invitation_id,
        userId: req.user.id,
        error: acceptError,
      });
      res.status(500).json({ error: "Failed to accept invitation" });
      return;
    }

    logger.info("Guardian invitation accepted", {
      invitationId: validatedData.invitation_id,
      userId: req.user.id,
    });

    res.json({
      message: "Invitation accepted successfully",
      guardian: acceptedInvitation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Accept invitation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get pending invitations for the current user
 */
export const getPendingInvitations = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const { data: invitations, error } = await supabaseAdmin
        .from("child_guardians")
        .select(
          `
        *,
        children(name, birth_date, gender),
        users!child_guardians_child_id_fkey(name, email)
      `,
        )
        .eq("user_id", req.user.id)
        .is("accepted_at", null)
        .order("invited_at", { ascending: false });

      if (error) {
        logger.error("Failed to get pending invitations", {
          userId: req.user.id,
          error,
        });
        res.status(500).json({ error: "Failed to get pending invitations" });
        return;
      }

      res.json({ invitations });
    } catch (error) {
      logger.error("Get pending invitations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Remove a guardian from a child
 */
export const removeGuardian = createAuthenticatedHandler(async (req, res) => {
  try {
    const { child_id, guardian_id } = req.params;

    // Check if user owns this child
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .select("owner_id")
      .eq("id", child_id)
      .single();

    if (childError || !child) {
      res.status(404).json({ error: "Child not found" });
      return;
    }

    if (child.owner_id !== req.user.id) {
      res
        .status(403)
        .json({ error: "Only the child owner can remove guardians" });
      return;
    }

    // Cannot remove the owner
    const { data: guardianToRemove, error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .select("user_id, role")
      .eq("id", guardian_id)
      .eq("child_id", child_id)
      .single();

    if (guardianError || !guardianToRemove) {
      res.status(404).json({ error: "Guardian not found" });
      return;
    }

    if (guardianToRemove.role === "owner") {
      res.status(400).json({ error: "Cannot remove the child owner" });
      return;
    }

    const { error } = await supabaseAdmin
      .from("child_guardians")
      .delete()
      .eq("id", guardian_id);

    if (error) {
      logger.error("Failed to remove guardian", {
        childId: child_id,
        guardianId: guardian_id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to remove guardian" });
      return;
    }

    logger.info("Guardian removed successfully", {
      childId: child_id,
      guardianId: guardian_id,
      userId: req.user.id,
    });

    res.json({ message: "Guardian removed successfully" });
  } catch (error) {
    logger.error("Remove guardian error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
