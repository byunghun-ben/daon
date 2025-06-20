import { z } from "zod";
import { 
  ACTIVITY_TYPES, 
  FEEDING_TYPES, 
  DIAPER_TYPES, 
  SLEEP_QUALITIES 
} from "@daon/shared";

// Activity type enum from shared constants
export const ActivityTypeSchema = z.enum([
  ACTIVITY_TYPES.FEEDING,
  ACTIVITY_TYPES.DIAPER,
  ACTIVITY_TYPES.SLEEP,
  ACTIVITY_TYPES.TUMMY_TIME,
  ACTIVITY_TYPES.CUSTOM
]);

// Feeding data schema
export const FeedingDataSchema = z.object({
  type: z.enum([
    FEEDING_TYPES.BREAST,
    FEEDING_TYPES.BOTTLE,
    FEEDING_TYPES.SOLID
  ], {
    required_error: "Feeding type is required"
  }),
  amount: z.number().positive("Amount must be positive").optional(),
  duration: z.number().positive("Duration must be positive").optional(),
});

// Diaper data schema
export const DiaperDataSchema = z.object({
  type: z.enum([
    DIAPER_TYPES.WET,
    DIAPER_TYPES.DIRTY,
    DIAPER_TYPES.BOTH
  ], {
    required_error: "Diaper type is required"
  }),
});

// Sleep data schema
export const SleepDataSchema = z.object({
  startTime: z.string().datetime("Invalid start time format"),
  endTime: z.string().datetime("Invalid end time format").optional(),
  quality: z.enum([
    SLEEP_QUALITIES.GOOD,
    SLEEP_QUALITIES.FAIR,
    SLEEP_QUALITIES.POOR
  ]).optional(),
}).refine(
  (data) => {
    if (data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

// Tummy time data schema
export const TummyTimeDataSchema = z.object({
  duration: z.number().positive("Duration must be positive"),
  position: z.enum(["tummy", "back", "side"]).optional(),
  notes: z.string().optional(),
});

// Custom activity data schema
export const CustomActivityDataSchema = z.object({
  activity_name: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
  duration: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
});

// Create activity schema
export const CreateActivitySchema = z.object({
  child_id: z.string().uuid("Invalid child ID"),
  type: ActivityTypeSchema,
  timestamp: z.string().datetime("Invalid timestamp format").optional(),
  data: z.union([
    FeedingDataSchema,
    DiaperDataSchema, 
    SleepDataSchema,
    TummyTimeDataSchema,
    CustomActivityDataSchema
  ]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
}).refine(
  (activity) => {
    // Validate data matches type
    switch (activity.type) {
      case ACTIVITY_TYPES.FEEDING:
        return FeedingDataSchema.safeParse(activity.data).success;
      case ACTIVITY_TYPES.DIAPER:
        return DiaperDataSchema.safeParse(activity.data).success;
      case ACTIVITY_TYPES.SLEEP:
        return SleepDataSchema.safeParse(activity.data).success;
      case ACTIVITY_TYPES.TUMMY_TIME:
        return TummyTimeDataSchema.safeParse(activity.data).success;
      case ACTIVITY_TYPES.CUSTOM:
        return CustomActivityDataSchema.safeParse(activity.data).success;
      default:
        return false;
    }
  },
  {
    message: "Activity data doesn't match the specified type",
    path: ["data"],
  }
);

// Update activity schema
export const UpdateActivitySchema = z.object({
  type: ActivityTypeSchema.optional(),
  timestamp: z.string().datetime("Invalid timestamp format").optional(),
  data: z.union([
    FeedingDataSchema,
    DiaperDataSchema,
    SleepDataSchema,
    TummyTimeDataSchema,
    CustomActivityDataSchema
  ]).optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Query filters schema
export const ActivityFiltersSchema = z.object({
  child_id: z.string().uuid().optional(),
  type: ActivityTypeSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
}).refine(
  (filters) => {
    if (filters.date_from && filters.date_to) {
      return new Date(filters.date_from) <= new Date(filters.date_to);
    }
    return true;
  },
  {
    message: "date_from must be before or equal to date_to",
    path: ["date_to"],
  }
);

// TypeScript types exported from schemas
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type FeedingData = z.infer<typeof FeedingDataSchema>;
export type DiaperData = z.infer<typeof DiaperDataSchema>;
export type SleepData = z.infer<typeof SleepDataSchema>;
export type TummyTimeData = z.infer<typeof TummyTimeDataSchema>;
export type CustomActivityData = z.infer<typeof CustomActivityDataSchema>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type ActivityFilters = z.infer<typeof ActivityFiltersSchema>;