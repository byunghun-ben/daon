import { supabaseAdmin } from "@/lib/supabase.js";
import type { Json } from "@/types/supabase.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import type { SleepDataApi } from "@daon/shared";
import {
  ActivityFiltersSchema,
  CreateActivityRequestSchema,
  UpdateActivityRequestSchema,
  apiToDb,
  dbToApi,
} from "@daon/shared";
import { type RequestHandler } from "express";
import { z } from "zod/v4";

/**
 * Helper function to safely convert data to Json type
 */
function toJson(data: unknown): Json {
  return JSON.parse(JSON.stringify(data)) as Json;
}

/**
 * Create a new activity record
 */
export const createActivity: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      // API 요청 검증 (camelCase)
      const validatedApiData = CreateActivityRequestSchema.parse(req.body);

      // Check if user has access to this child
      const { data: access, error: accessError } = await supabaseAdmin
        .from("child_guardians")
        .select("role")
        .eq("child_id", validatedApiData.childId)
        .eq("user_id", req.user.id)
        .not("accepted_at", "is", null)
        .single();

      if (accessError || !access) {
        logger.error("Child not found or access denied", {
          childId: validatedApiData.childId,
          userId: req.user.id,
          error: accessError,
        });
        res.status(404).json({ error: "Child not found or access denied" });
        return;
      }

      // Create activity record
      const { data: activity, error } = await supabaseAdmin
        .from("activities")
        .insert({
          child_id: validatedApiData.childId,
          user_id: req.user.id,
          type: validatedApiData.type,
          timestamp: validatedApiData.timestamp ?? new Date().toISOString(),
          data: validatedApiData.data ? toJson(validatedApiData.data) : null,
          notes: validatedApiData.notes,
        })
        .select(
          `
        *,
        children(name),
        users(name, email)
      `,
        )
        .single();

      if (error) {
        logger.error("Failed to create activity", {
          userId: req.user.id,
          childId: validatedApiData.childId,
          error,
        });
        res.status(500).json({ error: "Failed to create activity record" });
        return;
      }

      logger.info("Activity created successfully", {
        activityId: activity.id,
        childId: validatedApiData.childId,
        userId: req.user.id,
        type: validatedApiData.type,
      });

      // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
      const apiActivity = dbToApi(activity);

      res.status(201).json({
        message: "Activity recorded successfully",
        activity: apiActivity,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("Create activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Get activities with filtering
 */
export const getActivities: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const filters = ActivityFiltersSchema.parse(req.query);

      // Build query
      let query = supabaseAdmin.from("activities").select(`
        *,
        children(id, name),
        users(name, email)
      `);

      // Get accessible child IDs first
      const { data: guardianRelations } = await supabaseAdmin
        .from("child_guardians")
        .select("child_id")
        .eq("user_id", req.user.id)
        .not("accepted_at", "is", null);

      const accessibleChildIds =
        guardianRelations?.map((r) => r.child_id) ?? [];

      // Also include owned children
      const { data: ownedChildren } = await supabaseAdmin
        .from("children")
        .select("id")
        .eq("owner_id", req.user.id);

      const ownedChildIds = ownedChildren?.map((c) => c.id) ?? [];

      const allAccessibleChildIds = [...accessibleChildIds, ...ownedChildIds];

      if (allAccessibleChildIds.length === 0) {
        res.json({
          activities: [],
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

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.dateFrom) {
        query = query.gte("timestamp", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("timestamp", filters.dateTo);
      }

      // Add pagination and ordering
      const {
        data: activities,
        error,
        count,
      } = await query
        .order("timestamp", { ascending: false })
        .range(filters.offset, filters.offset + filters.limit - 1)
        .limit(filters.limit);

      if (error) {
        logger.error("Failed to get activities", {
          userId: req.user.id,
          filters,
          error,
        });
        res.status(500).json({ error: "Failed to get activities" });
        return;
      }

      // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
      const apiActivities = activities.map((activity) => dbToApi(activity));

      res.json({
        activities: apiActivities,
        total: count ?? activities.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid query parameters",
          details: error.issues,
        });
        return;
      }

      logger.error("Get activities error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Get a specific activity by ID
 */
export const getActivity: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: activity, error } = await supabaseAdmin
        .from("activities")
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
        users(name, email)
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
            .json({ error: "Activity not found or access denied" });
          return;
        }

        logger.error("Failed to get activity", {
          activityId: id,
          userId: req.user.id,
          error,
        });
        res.status(500).json({ error: "Failed to get activity" });
        return;
      }

      // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
      const apiActivity = dbToApi(activity);

      res.json({ activity: apiActivity });
    } catch (error) {
      logger.error("Get activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Update an activity record
 */
export const updateActivity: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const { id } = req.params;
      // API 요청 검증 (camelCase)
      const validatedApiData = UpdateActivityRequestSchema.parse(req.body);

      // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
      const dbData = apiToDb(validatedApiData);

      // Check if user created this activity
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("activities")
        .select("user_id, child_id")
        .eq("id", id)
        .single();

      if (existingError || !existing) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }

      if (existing.user_id !== req.user.id) {
        res
          .status(403)
          .json({ error: "Can only update your own activity records" });
        return;
      }

      const { data: updatedActivity, error } = await supabaseAdmin
        .from("activities")
        .update({
          ...dbData,
          data: dbData.data ? toJson(dbData.data) : null,
        })
        .eq("id", id)
        .select(
          `
        *,
        children(name),
        users(name, email)
      `,
        )
        .single();

      if (error) {
        logger.error("Failed to update activity", {
          activityId: id,
          userId: req.user.id,
          error,
        });
        res.status(500).json({ error: "Failed to update activity record" });
        return;
      }

      logger.info("Activity updated successfully", {
        activityId: id,
        userId: req.user.id,
      });

      // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
      const apiActivity = dbToApi(updatedActivity);

      res.json({
        message: "Activity updated successfully",
        activity: apiActivity,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("Update activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Delete an activity record
 */
export const deleteActivity: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user created this activity
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("activities")
        .select("user_id, child_id")
        .eq("id", id)
        .single();

      if (existingError || !existing) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }

      if (existing.user_id !== req.user.id) {
        res
          .status(403)
          .json({ error: "Can only delete your own activity records" });
        return;
      }

      const { error } = await supabaseAdmin
        .from("activities")
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Failed to delete activity", {
          activityId: id,
          userId: req.user.id,
          error,
        });
        res.status(500).json({ error: "Failed to delete activity record" });
        return;
      }

      logger.info("Activity deleted successfully", {
        activityId: id,
        userId: req.user.id,
      });

      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      logger.error("Delete activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

/**
 * Get activity summary for a child
 */
export const getActivitySummary: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const { child_id } = req.params;
      const { date } = req.query;

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

      // Default to today if no date provided
      const targetDate = date ? new Date(date as string) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: activities, error } = await supabaseAdmin
        .from("activities")
        .select("type, data, timestamp")
        .eq("child_id", child_id)
        .gte("timestamp", startOfDay.toISOString())
        .lte("timestamp", endOfDay.toISOString())
        .order("timestamp", { ascending: false });

      if (error) {
        logger.error("Failed to get activity summary", {
          childId: child_id,
          userId: req.user.id,
          error,
        });
        res.status(500).json({ error: "Failed to get activity summary" });
        return;
      }

      // Calculate summary statistics
      const summary = {
        date: targetDate.toISOString().split("T")[0],
        feeding: {
          count: activities.filter((a) => a.type === "feeding").length,
          lastTime: activities.find((a) => a.type === "feeding")?.timestamp,
        },
        diaper: {
          count: activities.filter((a) => a.type === "diaper").length,
          lastTime: activities.find((a) => a.type === "diaper")?.timestamp,
        },
        sleep: {
          count: activities.filter((a) => a.type === "sleep").length,
          totalHours: activities
            .filter((a) => {
              return (
                a.type === "sleep" &&
                a.data &&
                typeof a.data === "object" &&
                "endedAt" in a.data &&
                a.data.endedAt
              );
            })
            .reduce((total, activity) => {
              if (
                !activity.data ||
                typeof activity.data !== "object" ||
                !("endedAt" in activity.data)
              ) {
                return total;
              }
              const sleepData = activity.data as unknown as SleepDataApi;
              if (!sleepData.endedAt) return total;

              const start = new Date(sleepData.startedAt);
              const end = new Date(sleepData.endedAt);
              return (
                total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
              );
            }, 0),
          lastTime: activities.find((a) => a.type === "sleep")?.timestamp,
        },
        tummyTime: {
          count: activities.filter((a) => a.type === "tummy_time").length,
          totalMinutes: activities
            .filter((a) => a.type === "tummy_time")
            .reduce((total, activity) => {
              if (!activity.data || typeof activity.data !== "object")
                return total;
              const data = activity.data as { duration?: number };
              return total + (data.duration ?? 0);
            }, 0),
          lastTime: activities.find((a) => a.type === "tummy_time")?.timestamp,
        },
        totalActivities: activities.length,
      };

      res.json({ summary });
    } catch (error) {
      logger.error("Get activity summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
