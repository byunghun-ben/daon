import { supabaseAdmin } from "@/lib/supabase.js";
import type { TablesUpdate } from "@/types/supabase.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import {
  apiToDb,
  CreateChildRequestSchema,
  dbToApi,
  JoinChildRequestSchema,
  UpdateChildRequestSchema,
} from "@daon/shared";
import { z } from "zod/v4";

/**
 * Create a new child profile
 */
export const createChild = createAuthenticatedHandler(async (req, res) => {
  logger.info("createChild", {
    body: req.body as unknown,
    user: req.user,
  });

  try {
    // API 요청 검증 (camelCase)
    const validatedApiData = CreateChildRequestSchema.parse(req.body);

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = {
      name: validatedApiData.name,
      birth_date: validatedApiData.birthDate,
      gender: validatedApiData.gender,
      photo_url: validatedApiData.photoUrl,
      birth_weight: validatedApiData.birthWeight,
      birth_height: validatedApiData.birthHeight,
      owner_id: req.user.id,
    };

    const { data: child, error } = await supabaseAdmin
      .from("children")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      logger.error("Failed to create child", {
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to create child profile" });
      return;
    }

    // Also create guardian relationship with the provided role
    const { error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .insert({
        child_id: child.id,
        user_id: req.user.id,
        role: validatedApiData.role,
        accepted_at: new Date().toISOString(),
      });

    if (guardianError) {
      logger.error("Failed to create guardian relationship", {
        childId: child.id,
        userId: req.user.id,
        error: guardianError,
      });
    }

    logger.info("Child created successfully", {
      childId: child.id,
      userId: req.user.id,
    });

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiChild = dbToApi(child);

    res.status(201).json({
      message: "Child profile created successfully",
      child: apiChild,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Create child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get all children for the authenticated user
 */
export const getChildren = createAuthenticatedHandler(async (req, res) => {
  try {
    const { data: children, error } = await supabaseAdmin
      .from("children")
      .select(
        `
        *,
        child_guardians!inner(
          role,
          accepted_at
        )
      `,
      )
      .eq("child_guardians.user_id", req.user.id)
      .not("child_guardians.accepted_at", "is", null);

    if (error) {
      logger.error("Failed to get children", {
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to get children" });
      return;
    }

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiChildren = children.map((child) => dbToApi(child));

    res.json({ children: apiChildren });
  } catch (error) {
    logger.error("Get children error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get a specific child by ID
 */
export const getChild = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: child, error } = await supabaseAdmin
      .from("children")
      .select(
        `
        *,
        child_guardians!inner(
          role,
          accepted_at,
          users(name, email)
        )
      `,
      )
      .eq("id", id)
      .eq("child_guardians.user_id", req.user.id)
      .not("child_guardians.accepted_at", "is", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res.status(404).json({ error: "Child not found or access denied" });
        return;
      }

      logger.error("Failed to get child", {
        childId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to get child" });
      return;
    }

    res.json({ child });
  } catch (error) {
    logger.error("Get child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update a child profile
 */
export const updateChild = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // API 요청 검증 (camelCase)
    const validatedApiData = UpdateChildRequestSchema.parse(req.body);

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = apiToDb(validatedApiData);

    // Check if user owns this child
    const { data: ownership, error: ownershipError } = await supabaseAdmin
      .from("children")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (ownershipError || !ownership) {
      res.status(404).json({ error: "Child not found" });
      return;
    }

    if (ownership.owner_id !== req.user.id) {
      res
        .status(403)
        .json({ error: "Only the child owner can update profile" });
      return;
    }

    const { data: updatedChild, error } = await supabaseAdmin
      .from("children")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update child", {
        childId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to update child profile" });
      return;
    }

    logger.info("Child updated successfully", {
      childId: id,
      userId: req.user.id,
    });

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiChild = dbToApi(updatedChild);

    res.json({
      message: "Child profile updated successfully",
      child: apiChild,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Update child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete a child profile
 */
export const deleteChild = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this child
    const { data: ownership, error: ownershipError } = await supabaseAdmin
      .from("children")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (ownershipError || !ownership) {
      res.status(404).json({ error: "Child not found" });
      return;
    }

    if (ownership.owner_id !== req.user.id) {
      res
        .status(403)
        .json({ error: "Only the child owner can delete profile" });
      return;
    }

    const { error } = await supabaseAdmin
      .from("children")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Failed to delete child", {
        childId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to delete child profile" });
      return;
    }

    logger.info("Child deleted successfully", {
      childId: id,
      userId: req.user.id,
    });

    res.json({ message: "Child profile deleted successfully" });
  } catch (error) {
    logger.error("Delete child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Join an existing child using invite code (Step 2B of registration)
 */
export const joinChild = createAuthenticatedHandler(async (req, res) => {
  try {
    const validatedData = JoinChildRequestSchema.parse(req.body);
    const { inviteCode, role } = validatedData;

    // Find the child by invite code
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (childError || !child) {
      logger.warn("Invalid invite code", {
        userId: req.user.id,
        inviteCode,
        error: childError,
      });
      res.status(404).json({ error: "Invalid invite code" });
      return;
    }

    // Check if user is already connected to this child
    const { data: existingConnection } = await supabaseAdmin
      .from("child_guardians")
      .select("id")
      .eq("child_id", child.id)
      .eq("user_id", req.user.id)
      .single();

    if (existingConnection) {
      res
        .status(400)
        .json({ error: "You are already connected to this child" });
      return;
    }

    // Create guardian relationship with the provided role
    const { error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .insert({
        child_id: child.id,
        user_id: req.user.id,
        role,
        accepted_at: new Date().toISOString(),
      });

    if (guardianError) {
      logger.error("Failed to create guardian relationship", {
        userId: req.user.id,
        childId: child.id,
        error: guardianError,
      });
      res.status(500).json({ error: "Failed to join child" });
      return;
    }

    // Update user registration status to completed
    const { error: statusError } = await supabaseAdmin
      .from("users")
      .update({ registration_status: "completed" } as TablesUpdate<"users">)
      .eq("id", req.user.id);

    if (statusError) {
      logger.error("Failed to update registration status", {
        userId: req.user.id,
        error: statusError,
      });
    }

    logger.info("User joined child successfully", {
      userId: req.user.id,
      childId: child.id,
      inviteCode,
    });

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiChild = dbToApi({
      id: child.id,
      name: child.name,
      birth_date: child.birth_date,
      gender: child.gender,
      photo_url: child.photo_url,
    });

    res.json({
      message: "Successfully joined child",
      child: apiChild,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Join child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
