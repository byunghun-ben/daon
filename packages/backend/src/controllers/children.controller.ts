import { 
  CreateChildRequestSchema,
  UpdateChildRequestSchema,
  ChildDbSchema,
  ChildApiSchema,
  dbToApi,
  apiToDb
} from "@daon/shared";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../utils/logger";
import { createAuthenticatedHandler } from "../utils/auth-handler";
import { z } from "zod";

// DB 저장을 위한 변환 스키마 (camelCase → snake_case)
const CreateChildDbSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birth_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const now = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(now.getMonth() + 10); // 임신 기간 최대 10개월 고려

    return (
      !isNaN(parsedDate.getTime()) &&
      parsedDate >= new Date("1900-01-01") &&
      parsedDate <= maxFutureDate
    );
  }, "Birth date must be valid and within reasonable range (can be future for expected birth)"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  photo_url: z.string().url().nullable(),
  birth_weight: z.number().positive().nullable(),
  birth_height: z.number().positive().nullable(),
});

const UpdateChildDbSchema = CreateChildDbSchema.partial();

/**
 * Create a new child profile
 */
export const createChild = createAuthenticatedHandler(async (req, res) => {
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

    // Also create guardian relationship
    const { error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .insert({
        child_id: child.id,
        user_id: req.user.id,
        role: "owner",
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
        details: error.errors,
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
      `
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
    const apiChildren = children.map(child => dbToApi(child));

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
      `
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
        details: error.errors,
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
