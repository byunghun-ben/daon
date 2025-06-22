import z from "zod/v4";

// Milestone schemas
export const MilestoneDbSchema = z.object({
  id: z.uuid(),
  diary_entry_id: z.uuid(),
  type: z.enum([
    "first_smile",
    "first_step",
    "first_word",
    "first_tooth",
    "custom",
  ]),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  achieved_at: z.iso.datetime(),
});

export const MilestoneApiSchema = z.object({
  id: z.uuid(),
  diaryEntryId: z.uuid(),
  type: z.enum([
    "first_smile",
    "first_step",
    "first_word",
    "first_tooth",
    "custom",
  ]),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  achievedAt: z.iso.datetime(),
});

export const CreateMilestoneRequestSchema = z.object({
  type: z.enum([
    "first_smile",
    "first_step",
    "first_word",
    "first_tooth",
    "custom",
  ]),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  achievedAt: z.iso.datetime(),
});

// Diary entry schemas
export const DiaryEntryDbSchema = z.object({
  id: z.uuid(),
  child_id: z.uuid(),
  user_id: z.uuid(),
  title: z.string().min(1).max(200),
  content: z.string(),
  photos: z.array(z.url()),
  videos: z.array(z.url()),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const DiaryEntryApiSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  userId: z.uuid(),
  title: z.string().min(1).max(200),
  content: z.string(),
  photos: z.array(z.url()),
  videos: z.array(z.url()),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
  milestones: z.array(MilestoneApiSchema),
});

// Request schemas
export const CreateDiaryEntryRequestSchema = z.object({
  childId: z.uuid(),
  title: z.string().min(1).max(200),
  content: z.string(),
  photos: z.array(z.url()).default([]),
  videos: z.array(z.url()).default([]),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  milestones: z.array(CreateMilestoneRequestSchema).default([]),
});

export const UpdateDiaryEntryRequestSchema =
  CreateDiaryEntryRequestSchema.partial().omit({ childId: true });

// Filter schemas
export const DiaryFiltersSchema = z.object({
  childId: z.uuid().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
});

// Response schemas
export const DiaryEntryResponseSchema = z.object({
  diaryEntry: DiaryEntryApiSchema,
});

export const DiaryEntriesResponseSchema = z.object({
  diaryEntries: z.array(DiaryEntryApiSchema),
  total: z.number().nonnegative(),
});

// Inferred types
export type MilestoneDb = z.infer<typeof MilestoneDbSchema>;
export type MilestoneApi = z.infer<typeof MilestoneApiSchema>;
export type CreateMilestoneRequest = z.infer<
  typeof CreateMilestoneRequestSchema
>;

export type DiaryEntryDb = z.infer<typeof DiaryEntryDbSchema>;
export type DiaryEntryApi = z.infer<typeof DiaryEntryApiSchema>;
export type CreateDiaryEntryRequest = z.infer<
  typeof CreateDiaryEntryRequestSchema
>;
export type UpdateDiaryEntryRequest = z.infer<
  typeof UpdateDiaryEntryRequestSchema
>;
export type DiaryFilters = z.infer<typeof DiaryFiltersSchema>;
export type DiaryEntryResponse = z.infer<typeof DiaryEntryResponseSchema>;
export type DiaryEntriesResponse = z.infer<typeof DiaryEntriesResponseSchema>;
