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
  achieved_at: z.iso.datetime({ offset: true }),
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
  achievedAt: z.iso.datetime({ offset: true }),
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
  achievedAt: z.iso.datetime({ offset: true }),
  childId: z.uuid(),
  diaryEntryId: z.uuid().optional(),
});

// Diary entry schemas (실제 DB 구조에 맞춤)
export const DiaryEntryDbSchema = z.object({
  id: z.uuid(),
  child_id: z.uuid(),
  user_id: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // entry_date가 아닌 date 필드
  content: z.string(),
  photos: z.array(z.string()).nullable(), // TEXT[] 타입
  videos: z.array(z.string()).nullable(), // TEXT[] 타입
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

export const DiaryEntryApiSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  userId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string(),
  photos: z.array(z.string()).nullable(),
  videos: z.array(z.string()).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  user: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    email: z.email(),
  }),
  milestones: z.array(MilestoneApiSchema),
});

// Request schemas
export const CreateDiaryEntryRequestSchema = z.object({
  childId: z.uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string(),
  photos: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  milestones: z.array(CreateMilestoneRequestSchema).default([]),
});

export const UpdateDiaryEntryRequestSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  content: z.string().optional(),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  milestones: z.array(CreateMilestoneRequestSchema).optional(),
});

// Filter schemas - for query parameters (all strings that need to be transformed)
export const DiaryFiltersSchema = z.object({
  childId: z.uuid().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().positive().max(100).default(20),
  offset: z.coerce.number().nonnegative().default(0),
});

// Response schemas
export const DiaryEntryResponseSchema = z.object({
  diaryEntry: DiaryEntryApiSchema,
});

export const DiaryEntriesResponseSchema = z.object({
  diaryEntries: z.array(DiaryEntryApiSchema),
  pagination: z.object({
    total: z.number().nonnegative(),
    limit: z.number().positive(),
    offset: z.number().nonnegative(),
  }),
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
