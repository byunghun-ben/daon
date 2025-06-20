import { z } from "zod";
import { MILESTONE_TYPES } from "@daon/shared";

// Create diary entry schema
export const CreateDiaryEntrySchema = z.object({
  child_id: z.string().uuid("Invalid child ID"),
  date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format"),
  content: z.string().min(1, "Content is required").max(5000, "Content cannot exceed 5000 characters"),
  photos: z.array(z.string().url()).max(10, "Maximum 10 photos allowed").optional(),
  videos: z.array(z.string().url()).max(3, "Maximum 3 videos allowed").optional(),
});

// Update diary entry schema
export const UpdateDiaryEntrySchema = z.object({
  date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format").optional(),
  content: z.string().min(1, "Content is required").max(5000, "Content cannot exceed 5000 characters").optional(),
  photos: z.array(z.string().url()).max(10, "Maximum 10 photos allowed").optional(),
  videos: z.array(z.string().url()).max(3, "Maximum 3 videos allowed").optional(),
});

// Diary entry filters schema
export const DiaryFiltersSchema = z.object({
  child_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
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

// Milestone schema
export const MilestoneSchema = z.object({
  type: z.enum([
    MILESTONE_TYPES.FIRST_SMILE,
    MILESTONE_TYPES.FIRST_STEP,
    MILESTONE_TYPES.FIRST_WORD,
    MILESTONE_TYPES.CUSTOM
  ]),
  description: z.string().min(1, "Description is required").max(200, "Description cannot exceed 200 characters"),
  achieved_at: z.string().datetime("Invalid achievement time format"),
  diary_entry_id: z.string().uuid().optional(),
  child_id: z.string().uuid("Invalid child ID"),
});

// TypeScript types
export type CreateDiaryEntryInput = z.infer<typeof CreateDiaryEntrySchema>;
export type UpdateDiaryEntryInput = z.infer<typeof UpdateDiaryEntrySchema>;
export type DiaryFilters = z.infer<typeof DiaryFiltersSchema>;
export type MilestoneInput = z.infer<typeof MilestoneSchema>;