import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../utils/logger";
import { createAuthenticatedHandler } from "../utils/auth-handler";
import {
  CreateDiaryEntrySchema,
  UpdateDiaryEntrySchema,
  DiaryFiltersSchema,
  MilestoneSchema,
  type CreateDiaryEntryInput,
  type UpdateDiaryEntryInput,
  type DiaryFilters,
  type MilestoneInput,
} from "../schemas/diary.schemas";

/**
 * Create a new diary entry
 */
export const createDiaryEntry = createAuthenticatedHandler(async (req, res) => {
  try {
    const validatedData = CreateDiaryEntrySchema.parse(req.body);

    // Check if user has access to this child
    const { data: access, error: accessError } = await supabaseAdmin
      .from("child_guardians")
      .select("role")
      .eq("child_id", validatedData.child_id)
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null)
      .single();

    if (accessError || !access) {
      res.status(404).json({ error: "Child not found or access denied" });
      return;
    }

    // Create diary entry
    const { data: diaryEntry, error } = await supabaseAdmin
      .from("diary_entries")
      .insert({
        child_id: validatedData.child_id,
        user_id: req.user.id,
        date: validatedData.date,
        content: validatedData.content,
        photos: validatedData.photos || [],
        videos: validatedData.videos || [],
      })
      .select(`
        *,
        children(name),
        users(name, email)
      `)
      .single();

    if (error) {
      logger.error("Failed to create diary entry", { 
        userId: req.user.id,
        childId: validatedData.child_id,
        error 
      });
      res.status(500).json({ error: "Failed to create diary entry" });
      return;
    }

    logger.info("Diary entry created successfully", { 
      diaryEntryId: diaryEntry.id,
      childId: validatedData.child_id,
      userId: req.user.id
    });

    res.status(201).json({
      message: "Diary entry created successfully",
      diaryEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
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
    let query = supabaseAdmin
      .from("diary_entries")
      .select(`
        *,
        children(id, name),
        users(name, email),
        milestones(*)
      `);

    // Get accessible child IDs first
    const { data: guardianRelations } = await supabaseAdmin
      .from("child_guardians")
      .select("child_id")
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null);

    const accessibleChildIds = guardianRelations?.map((r) => r.child_id) || [];

    // Also include owned children
    const { data: ownedChildren } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("owner_id", req.user.id);

    const ownedChildIds = ownedChildren?.map((c) => c.id) || [];

    const allAccessibleChildIds = [...accessibleChildIds, ...ownedChildIds];

    if (allAccessibleChildIds.length === 0) {
      res.json({
        diaryEntries: [],
        pagination: { total: 0, page: 1, limit: 10 },
      });
      return;
    }

    // Add child access filter
    query = query.in("child_id", allAccessibleChildIds);

    // Apply filters
    if (filters.child_id) {
      query = query.eq("child_id", filters.child_id);
    }

    if (filters.date_from) {
      query = query.gte("date", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("date", filters.date_to);
    }

    // Add pagination and ordering
    const { data: diaryEntries, error, count } = await query
      .order("date", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1)
      .limit(filters.limit);

    if (error) {
      logger.error("Failed to get diary entries", { 
        userId: req.user.id,
        filters,
        error 
      });
      res.status(500).json({ error: "Failed to get diary entries" });
      return;
    }

    res.json({
      diaryEntries,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: count || diaryEntries.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Invalid query parameters", 
        details: error.errors 
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
      .select(`
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
      `)
      .eq("id", id)
      .eq("children.child_guardians.user_id", req.user.id)
      .not("children.child_guardians.accepted_at", "is", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res.status(404).json({ error: "Diary entry not found or access denied" });
        return;
      }

      logger.error("Failed to get diary entry", { 
        diaryEntryId: id,
        userId: req.user.id,
        error 
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
    const validatedData = UpdateDiaryEntrySchema.parse(req.body);

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
      .select(`
        *,
        children(name),
        users(name, email),
        milestones(*)
      `)
      .single();

    if (error) {
      logger.error("Failed to update diary entry", { 
        diaryEntryId: id,
        userId: req.user.id,
        error 
      });
      res.status(500).json({ error: "Failed to update diary entry" });
      return;
    }

    logger.info("Diary entry updated successfully", { 
      diaryEntryId: id,
      userId: req.user.id 
    });

    res.json({
      message: "Diary entry updated successfully",
      diaryEntry: updatedEntry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
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
        error 
      });
      res.status(500).json({ error: "Failed to delete diary entry" });
      return;
    }

    logger.info("Diary entry deleted successfully", { 
      diaryEntryId: id,
      userId: req.user.id 
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
    const validatedData = MilestoneSchema.parse(req.body);

    // Check if user has access to this child
    const { data: access, error: accessError } = await supabaseAdmin
      .from("child_guardians")
      .select("role")
      .eq("child_id", validatedData.child_id)
      .eq("user_id", req.user.id)
      .not("accepted_at", "is", null)
      .single();

    if (accessError || !access) {
      res.status(404).json({ error: "Child not found or access denied" });
      return;
    }

    // Create milestone
    const { data: milestone, error } = await supabaseAdmin
      .from("milestones")
      .insert(validatedData)
      .select(`
        *,
        children(name),
        diary_entries(date, content)
      `)
      .single();

    if (error) {
      logger.error("Failed to create milestone", { 
        userId: req.user.id,
        childId: validatedData.child_id,
        error 
      });
      res.status(500).json({ error: "Failed to create milestone" });
      return;
    }

    logger.info("Milestone created successfully", { 
      milestoneId: milestone.id,
      childId: validatedData.child_id,
      userId: req.user.id
    });

    res.status(201).json({
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
      return;
    }

    logger.error("Add milestone error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});