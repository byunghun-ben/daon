import { supabaseAdmin } from "@/lib/supabase.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import {
  CreateDiaryEntryRequestSchema,
  CreateMilestoneRequestSchema,
  DiaryFiltersSchema,
  UpdateDiaryEntryRequestSchema,
} from "@daon/shared";
import { z } from "zod/v4";

/**
 * Create a new diary entry
 */
export const createDiaryEntry = createAuthenticatedHandler(async (req, res) => {
  try {
    // API 요청 검증 (camelCase)
    const validatedApiData = CreateDiaryEntryRequestSchema.parse(req.body);

    // Check if user has access to this child
    const { data: access, error: accessError } = await supabaseAdmin
      .from("child_guardians")
      .select("role")
      .eq("child_id", validatedApiData.childId)
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null)
      .single();

    if (accessError || !access) {
      res.status(404).json({ error: "Child not found or access denied" });
      return;
    }

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = {
      child_id: validatedApiData.childId,
      user_id: req.user.id,
      date: validatedApiData.date,
      content: validatedApiData.content,
      photos: validatedApiData.photos || [],
      videos: validatedApiData.videos || [],
    };

    // Create diary entry
    const { data: diaryEntry, error } = await supabaseAdmin
      .from("diary_entries")
      .insert(dbData)
      .select(
        `
        *,
        children(name),
        users(name, email)
      `,
      )
      .single();

    if (error) {
      logger.error("Failed to create diary entry", {
        userId: req.user.id,
        childId: validatedApiData.childId,
        error,
      });
      res.status(500).json({ error: "Failed to create diary entry" });
      return;
    }

    logger.info("Diary entry created successfully", {
      diaryEntryId: diaryEntry.id,
      childId: validatedApiData.childId,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Diary entry created successfully",
      diaryEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Create diary entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get diary entries with filtering
 */
export const getDiaryEntries = createAuthenticatedHandler(async (req, res) => {
  try {
    const filters = DiaryFiltersSchema.parse(req.query);

    // Build query
    let query = supabaseAdmin.from("diary_entries").select(
      `
        *,
        children(id, name),
        users(name, email),
        milestones(*)
      `,
      { count: "exact" },
    );

    // Get accessible child IDs first
    const { data: guardianRelations } = await supabaseAdmin
      .from("child_guardians")
      .select("child_id")
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null);

    const accessibleChildIds = guardianRelations?.map((r) => r.child_id) ?? [];

    // Also include owned children
    const { data: ownedChildren } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("owner_id", req.user.id);

    const ownedChildIds = ownedChildren?.map((c) => c.id) ?? [];

    const allAccessibleChildIds = [...accessibleChildIds, ...ownedChildIds];

    if (allAccessibleChildIds.length === 0) {
      res.json({
        diaryEntries: [],
        total: 0,
      });
      return;
    }

    // Add child access filter
    query = query.in("child_id", allAccessibleChildIds);

    // Apply filters
    if (filters.childId) {
      query = query.eq("child_id", filters.childId);
    }

    if (filters.dateFrom) {
      query = query.gte("date", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("date", filters.dateTo);
    }

    // Add pagination and ordering
    const {
      data: diaryEntries,
      error,
      count,
    } = await query
      .order("date", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) {
      logger.error("Failed to get diary entries", {
        userId: req.user.id,
        filters,
        error,
      });
      res.status(500).json({ error: "Failed to get diary entries" });
      return;
    }

    res.json({
      diaryEntries,
      pagination: {
        total: count ?? diaryEntries.length,
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: error.issues,
      });
      return;
    }

    logger.error("Get diary entries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get a specific diary entry by ID
 */
export const getDiaryEntry = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: diaryEntry, error } = await supabaseAdmin
      .from("diary_entries")
      .select(
        `
        *,
        children!inner(
          id, name,
          child_guardians!inner(
            user_id,
            accepted_at
          )
        ),
        users(name, email),
        milestones(*)
      `,
      )
      .eq("id", id)
      .eq("children.child_guardians.user_id", req.user.id)
      .not("children.child_guardians.accepted_at", "is", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res
          .status(404)
          .json({ error: "Diary entry not found or access denied" });
        return;
      }

      logger.error("Failed to get diary entry", {
        diaryEntryId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to get diary entry" });
      return;
    }

    res.json({ diaryEntry });
  } catch (error) {
    logger.error("Get diary entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update a diary entry
 */
export const updateDiaryEntry = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateDiaryEntryRequestSchema.parse(req.body);

    // Check if user created this diary entry
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("diary_entries")
      .select("user_id, child_id")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      res.status(404).json({ error: "Diary entry not found" });
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(403).json({ error: "Can only update your own diary entries" });
      return;
    }

    const { data: updatedEntry, error } = await supabaseAdmin
      .from("diary_entries")
      .update(validatedData)
      .eq("id", id)
      .select(
        `
        *,
        children(name),
        users(name, email),
        milestones(*)
      `,
      )
      .single();

    if (error) {
      logger.error("Failed to update diary entry", {
        diaryEntryId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to update diary entry" });
      return;
    }

    logger.info("Diary entry updated successfully", {
      diaryEntryId: id,
      userId: req.user.id,
    });

    res.json({
      message: "Diary entry updated successfully",
      diaryEntry: updatedEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Update diary entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete a diary entry
 */
export const deleteDiaryEntry = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user created this diary entry
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("diary_entries")
      .select("user_id, child_id")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      res.status(404).json({ error: "Diary entry not found" });
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(403).json({ error: "Can only delete your own diary entries" });
      return;
    }

    const { error } = await supabaseAdmin
      .from("diary_entries")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Failed to delete diary entry", {
        diaryEntryId: id,
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to delete diary entry" });
      return;
    }

    logger.info("Diary entry deleted successfully", {
      diaryEntryId: id,
      userId: req.user.id,
    });

    res.json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    logger.error("Delete diary entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Add milestone to a diary entry or standalone
 */
export const addMilestone = createAuthenticatedHandler(async (req, res) => {
  try {
    const validatedData = CreateMilestoneRequestSchema.parse(req.body);

    // Check if user has access to this child
    const { data: access, error: accessError } = await supabaseAdmin
      .from("child_guardians")
      .select("role")
      .eq("child_id", validatedData.childId)
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null)
      .single();

    if (accessError || !access) {
      res.status(404).json({ error: "Child not found or access denied" });
      return;
    }

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = {
      type: validatedData.type,
      title: validatedData.title,
      description: validatedData.description ?? "",
      achieved_at: validatedData.achievedAt,
      child_id: validatedData.childId,
      diary_entry_id: validatedData.diaryEntryId ?? null,
    };

    // Create milestone
    const { data: milestone, error } = await supabaseAdmin
      .from("milestones")
      .insert(dbData)
      .select(
        `
        *,
        children(name),
        diary_entries(date, content)
      `,
      )
      .single();

    if (error) {
      logger.error("Failed to create milestone", {
        userId: req.user.id,
        childId: validatedData.childId,
        error,
      });
      res.status(500).json({ error: "Failed to create milestone" });
      return;
    }

    logger.info("Milestone created successfully", {
      milestoneId: milestone.id,
      childId: validatedData.childId,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Add milestone error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
