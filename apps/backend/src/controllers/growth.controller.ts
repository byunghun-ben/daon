import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../utils/logger";
import { createAuthenticatedHandler } from "../utils/auth-handler";
import {
  CreateGrowthRecordRequestSchema,
  UpdateGrowthRecordRequestSchema,
  GrowthFiltersSchema,
  dbToApi,
} from "@daon/shared";

/**
 * Create a new growth record
 */
export const createGrowthRecord = createAuthenticatedHandler(async (req, res) => {
  try {
    // API 요청 검증 (camelCase)
    const validatedApiData = CreateGrowthRecordRequestSchema.parse(req.body);

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

    // Create growth record
    const { data: growthRecord, error } = await supabaseAdmin
      .from("growth_records")
      .insert({
        child_id: validatedApiData.childId,
        user_id: req.user.id,
        recorded_at: validatedApiData.recordedAt || new Date().toISOString(),
        weight: validatedApiData.weight,
        height: validatedApiData.height,
        head_circumference: validatedApiData.headCircumference,
      })
      .select(`
        *,
        children(name, birth_date),
        users(name, email)
      `)
      .single();

    if (error) {
      logger.error("Failed to create growth record", { 
        userId: req.user.id,
        childId: validatedApiData.childId,
        error 
      });
      res.status(500).json({ error: "Failed to create growth record" });
      return;
    }

    logger.info("Growth record created successfully", { 
      growthRecordId: growthRecord.id,
      childId: validatedApiData.childId,
      userId: req.user.id
    });

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiGrowthRecord = dbToApi(growthRecord);

    res.status(201).json({
      message: "Growth record created successfully",
      growthRecord: apiGrowthRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
      return;
    }

    logger.error("Create growth record error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get growth records with filtering
 */
export const getGrowthRecords = createAuthenticatedHandler(async (req, res) => {
  try {
    const filters = GrowthFiltersSchema.parse(req.query);

    // Build query
    let query = supabaseAdmin
      .from("growth_records")
      .select(`
        *,
        children(id, name, birth_date),
        users(name, email)
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
        growthRecords: [],
        pagination: { total: 0, page: 1, limit: 10 },
      });
      return;
    }

    // Add child access filter
    query = query.in("child_id", allAccessibleChildIds);

    // Apply filters
    if (filters.childId) {
      query = query.eq("child_id", filters.childId);
    }

    if (filters.startDate) {
      query = query.gte("recorded_at", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("recorded_at", filters.endDate);
    }

    // Add pagination and ordering
    const { data: growthRecords, error, count } = await query
      .order("recorded_at", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1)
      .limit(filters.limit);

    if (error) {
      logger.error("Failed to get growth records", { 
        userId: req.user.id,
        filters,
        error 
      });
      res.status(500).json({ error: "Failed to get growth records" });
      return;
    }

    res.json({
      growthRecords,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: count || growthRecords.length,
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

    logger.error("Get growth records error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get a specific growth record by ID
 */
export const getGrowthRecord = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data: growthRecord, error } = await supabaseAdmin
      .from("growth_records")
      .select(`
        *,
        children!inner(
          id, name, birth_date,
          child_guardians!inner(
            user_id,
            accepted_at
          )
        ),
        users(name, email)
      `)
      .eq("id", id)
      .eq("children.child_guardians.user_id", req.user.id)
      .not("children.child_guardians.accepted_at", "is", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        res.status(404).json({ error: "Growth record not found or access denied" });
        return;
      }

      logger.error("Failed to get growth record", { 
        growthRecordId: id,
        userId: req.user.id,
        error 
      });
      res.status(500).json({ error: "Failed to get growth record" });
      return;
    }

    res.json({ growthRecord });
  } catch (error) {
    logger.error("Get growth record error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update a growth record
 */
export const updateGrowthRecord = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateGrowthRecordRequestSchema.parse(req.body);

    // Check if user created this growth record
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("growth_records")
      .select("user_id, child_id")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      res.status(404).json({ error: "Growth record not found" });
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(403).json({ error: "Can only update your own growth records" });
      return;
    }

    const { data: updatedRecord, error } = await supabaseAdmin
      .from("growth_records")
      .update(validatedData)
      .eq("id", id)
      .select(`
        *,
        children(name, birth_date),
        users(name, email)
      `)
      .single();

    if (error) {
      logger.error("Failed to update growth record", { 
        growthRecordId: id,
        userId: req.user.id,
        error 
      });
      res.status(500).json({ error: "Failed to update growth record" });
      return;
    }

    logger.info("Growth record updated successfully", { 
      growthRecordId: id,
      userId: req.user.id 
    });

    res.json({
      message: "Growth record updated successfully",
      growthRecord: updatedRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
      return;
    }

    logger.error("Update growth record error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete a growth record
 */
export const deleteGrowthRecord = createAuthenticatedHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user created this growth record
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("growth_records")
      .select("user_id, child_id")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      res.status(404).json({ error: "Growth record not found" });
      return;
    }

    if (existing.user_id !== req.user.id) {
      res.status(403).json({ error: "Can only delete your own growth records" });
      return;
    }

    const { error } = await supabaseAdmin
      .from("growth_records")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Failed to delete growth record", { 
        growthRecordId: id,
        userId: req.user.id,
        error 
      });
      res.status(500).json({ error: "Failed to delete growth record" });
      return;
    }

    logger.info("Growth record deleted successfully", { 
      growthRecordId: id,
      userId: req.user.id 
    });

    res.json({ message: "Growth record deleted successfully" });
  } catch (error) {
    logger.error("Delete growth record error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get growth chart data for a child
 */
export const getGrowthChart = createAuthenticatedHandler(async (req, res) => {
  try {
    const { child_id } = req.params;

    // Check access to child
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

    // Get child info for age calculation
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .select("birth_date, gender")
      .eq("id", child_id)
      .single();

    if (childError || !child) {
      res.status(404).json({ error: "Child not found" });
      return;
    }

    // Get all growth records for this child
    const { data: growthRecords, error } = await supabaseAdmin
      .from("growth_records")
      .select("*")
      .eq("child_id", child_id)
      .order("recorded_at", { ascending: true });

    if (error) {
      logger.error("Failed to get growth chart data", { 
        childId: child_id,
        userId: req.user.id,
        error 
      });
      res.status(500).json({ error: "Failed to get growth chart data" });
      return;
    }

    // Calculate ages for each record
    const birthDate = new Date(child.birth_date);
    const chartData = growthRecords.map(record => {
      const recordDate = new Date(record.recorded_at);
      const ageInDays = Math.floor((recordDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInMonths = ageInDays / 30.44; // Average days per month

      return {
        ...record,
        ageInDays,
        ageInMonths: Math.round(ageInMonths * 10) / 10, // Round to 1 decimal place
      };
    });

    res.json({
      childInfo: {
        birth_date: child.birth_date,
        gender: child.gender,
      },
      chartData,
      summary: {
        totalRecords: chartData.length,
        latestRecord: chartData[chartData.length - 1] || null,
        firstRecord: chartData[0] || null,
      },
    });
  } catch (error) {
    logger.error("Get growth chart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});