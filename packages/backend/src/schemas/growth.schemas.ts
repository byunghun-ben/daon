import { z } from "zod";

// Create growth record schema
export const CreateGrowthRecordSchema = z.object({
  child_id: z.string().uuid("Invalid child ID"),
  recorded_at: z.string().datetime("Invalid recorded time format").optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  height: z.number().positive("Height must be positive").optional(),
  head_circumference: z.number().positive("Head circumference must be positive").optional(),
}).refine(
  (data) => {
    // At least one measurement must be provided
    return data.weight || data.height || data.head_circumference;
  },
  {
    message: "At least one measurement (weight, height, or head circumference) is required",
    path: ["weight"],
  }
);

// Update growth record schema
export const UpdateGrowthRecordSchema = z.object({
  recorded_at: z.string().datetime("Invalid recorded time format").optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  height: z.number().positive("Height must be positive").optional(),
  head_circumference: z.number().positive("Head circumference must be positive").optional(),
});

// Growth record filters schema
export const GrowthFiltersSchema = z.object({
  child_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
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

// TypeScript types
export type CreateGrowthRecordInput = z.infer<typeof CreateGrowthRecordSchema>;
export type UpdateGrowthRecordInput = z.infer<typeof UpdateGrowthRecordSchema>;
export type GrowthFilters = z.infer<typeof GrowthFiltersSchema>;