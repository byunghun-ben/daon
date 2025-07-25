import z from "zod/v4";

// Activity type enum
export const ActivityTypeSchema = z.enum([
  "feeding",
  "diaper",
  "sleep",
  "tummy_time",
  "custom",
]);

// Feeding data schemas
export const FeedingDataDbSchema = z.object({
  id: z.uuid(),
  activity_id: z.uuid(),
  type: z.enum(["breast", "bottle", "solid"]),
  amount: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  side: z.enum(["left", "right", "both"]).optional(),
});

export const FeedingDataApiSchema = z.object({
  id: z.uuid(),
  activityId: z.uuid(),
  type: z.enum(["breast", "bottle", "solid"]),
  amount: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  side: z.enum(["left", "right", "both"]).optional(),
});

export const CreateFeedingDataRequestSchema = z.object({
  type: z.enum(["breast", "bottle", "solid"]),
  amount: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  side: z.enum(["left", "right", "both"]).optional(),
});

// Diaper data schemas
export const DiaperDataDbSchema = z.object({
  id: z.uuid(),
  activity_id: z.uuid(),
  type: z.enum(["wet", "dirty", "both"]),
});

export const DiaperDataApiSchema = z.object({
  id: z.uuid(),
  activityId: z.uuid(),
  type: z.enum(["wet", "dirty", "both"]),
});

export const CreateDiaperDataRequestSchema = z.object({
  type: z.enum(["wet", "dirty", "both"]),
});

// Sleep data schemas
export const SleepDataDbSchema = z.object({
  id: z.uuid(),
  activity_id: z.uuid(),
  started_at: z.iso.datetime(),
  ended_at: z.iso.datetime().optional(),
  quality: z.enum(["good", "fair", "poor"]).optional(),
});

export const SleepDataApiSchema = z.object({
  id: z.uuid(),
  activityId: z.uuid(),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().optional(),
  quality: z.enum(["good", "fair", "poor"]).optional(),
});

export const CreateSleepDataRequestSchema = z.object({
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().optional(),
  quality: z.enum(["good", "fair", "poor"]).optional(),
});

// Tummy time data schemas
export const TummyTimeDataDbSchema = z.object({
  id: z.uuid(),
  activity_id: z.uuid(),
  duration: z.number().positive(),
});

export const TummyTimeDataApiSchema = z.object({
  id: z.uuid(),
  activityId: z.uuid(),
  duration: z.number().positive(),
});

export const CreateTummyTimeDataRequestSchema = z.object({
  duration: z.number().positive(),
});

// Main activity schemas (실제 DB 구조에 맞춤)
export const ActivityDbSchema = z.object({
  id: z.uuid(),
  child_id: z.uuid(),
  user_id: z.uuid(),
  type: ActivityTypeSchema,
  timestamp: z.iso.datetime().default(() => new Date().toISOString()), // timestamp 필드 사용
  data: z.record(z.string(), z.unknown()), // JSONB 타입으로 활동별 데이터 저장
  notes: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const ActivityApiSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  userId: z.uuid(),
  type: ActivityTypeSchema,
  timestamp: z.iso.datetime(),
  data: z.union([
    FeedingDataApiSchema,
    DiaperDataApiSchema,
    SleepDataApiSchema,
    TummyTimeDataApiSchema,
  ]),
  notes: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  user: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    email: z.email(),
  }),
});

// Request schemas
export const CreateActivityRequestSchema = z.object({
  childId: z.uuid(),
  type: ActivityTypeSchema,
  timestamp: z.iso.datetime().optional(), // 기본값은 서버에서 현재 시간
  data: z.union([
    CreateFeedingDataRequestSchema,
    CreateDiaperDataRequestSchema,
    CreateSleepDataRequestSchema,
    CreateTummyTimeDataRequestSchema,
  ]),
  notes: z.string().nullable().optional(),
});

export const UpdateActivityRequestSchema = z.object({
  type: ActivityTypeSchema.optional(),
  timestamp: z.iso.datetime().optional(),
  data: z.union([
    CreateFeedingDataRequestSchema,
    CreateDiaperDataRequestSchema,
    CreateSleepDataRequestSchema,
    CreateTummyTimeDataRequestSchema,
  ]),
  notes: z.string().nullable().optional(),
});

// Filter schemas - for query parameters (all strings that need to be transformed)
export const ActivityFiltersSchema = z.object({
  childId: z.uuid().optional(),
  type: ActivityTypeSchema.optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  limit: z.coerce.number().positive().max(100).default(20),
  offset: z.coerce.number().nonnegative().default(0),
});

// Response schemas
export const ActivityResponseSchema = z.object({
  activity: ActivityApiSchema,
});

export const ActivitiesResponseSchema = z.object({
  activities: z.array(ActivityApiSchema),
  total: z.number().nonnegative(),
});

export const ActivitySummaryResponseSchema = z.object({
  summary: z.object({
    todayCount: z.number().nonnegative(),
    recentActivities: z.array(ActivityApiSchema),
    totalCount: z.number().nonnegative(),
  }),
});

// Inferred types
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export type FeedingDataDb = z.infer<typeof FeedingDataDbSchema>;
export type FeedingDataApi = z.infer<typeof FeedingDataApiSchema>;
export type CreateFeedingDataRequest = z.infer<
  typeof CreateFeedingDataRequestSchema
>;

export type DiaperDataDb = z.infer<typeof DiaperDataDbSchema>;
export type DiaperDataApi = z.infer<typeof DiaperDataApiSchema>;
export type CreateDiaperDataRequest = z.infer<
  typeof CreateDiaperDataRequestSchema
>;

export type SleepDataDb = z.infer<typeof SleepDataDbSchema>;
export type SleepDataApi = z.infer<typeof SleepDataApiSchema>;
export type CreateSleepDataRequest = z.infer<
  typeof CreateSleepDataRequestSchema
>;

export type TummyTimeDataDb = z.infer<typeof TummyTimeDataDbSchema>;
export type TummyTimeDataApi = z.infer<typeof TummyTimeDataApiSchema>;
export type CreateTummyTimeDataRequest = z.infer<
  typeof CreateTummyTimeDataRequestSchema
>;

export type ActivityDb = z.infer<typeof ActivityDbSchema>;
export type ActivityApi = z.infer<typeof ActivityApiSchema>;
export type CreateActivityRequest = z.infer<typeof CreateActivityRequestSchema>;
export type UpdateActivityRequest = z.infer<typeof UpdateActivityRequestSchema>;
export type ActivityFilters = z.infer<typeof ActivityFiltersSchema>;
export type ActivityResponse = z.infer<typeof ActivityResponseSchema>;
export type ActivitiesResponse = z.infer<typeof ActivitiesResponseSchema>;
export type ActivitySummaryResponse = z.infer<
  typeof ActivitySummaryResponseSchema
>;
