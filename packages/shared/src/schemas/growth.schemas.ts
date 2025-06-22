import z from "zod/v4";

// Growth record schemas
export const GrowthRecordDbSchema = z.object({
  id: z.uuid(),
  child_id: z.uuid(),
  user_id: z.uuid(),
  weight: z.number().positive().nullable(), // kg
  height: z.number().positive().nullable(), // cm
  head_circumference: z.number().positive().nullable(), // cm
  recorded_at: z.iso.datetime(),
  notes: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const GrowthRecordApiSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  userId: z.uuid(),
  weight: z.number().positive().nullable(), // kg
  height: z.number().positive().nullable(), // cm
  headCircumference: z.number().positive().nullable(), // cm
  recordedAt: z.iso.datetime(),
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
export const CreateGrowthRecordRequestSchema = z
  .object({
    childId: z.uuid(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    headCircumference: z.number().positive().optional(),
    recordedAt: z.iso.datetime(),
    notes: z.string().optional(),
  })
  .refine((data) => data.weight ?? data.height ?? data.headCircumference, {
    message:
      "At least one measurement (weight, height, or head circumference) is required",
    path: ["measurements"],
  });

export const UpdateGrowthRecordRequestSchema =
  CreateGrowthRecordRequestSchema.partial().omit({ childId: true });

// Filter schemas
export const GrowthFiltersSchema = z.object({
  childId: z.uuid().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  limit: z.number().positive().max(100).default(50),
  offset: z.number().nonnegative().default(0),
});

// Response schemas
export const GrowthRecordResponseSchema = z.object({
  growthRecord: GrowthRecordApiSchema,
});

export const GrowthRecordsResponseSchema = z.object({
  growthRecords: z.array(GrowthRecordApiSchema),
  total: z.number().nonnegative(),
});

// Chart data schemas
export const GrowthChartDataSchema = z.object({
  childId: z.uuid(),
  records: z.array(
    z.object({
      recordedAt: z.iso.datetime(),
      weight: z.number().positive().optional(),
      height: z.number().positive().optional(),
      headCircumference: z.number().positive().optional(),
      ageInDays: z.number().nonnegative(),
    })
  ),
  whoPercentiles: z.object({
    weight: z
      .array(
        z.object({
          ageInDays: z.number().nonnegative(),
          p3: z.number(),
          p10: z.number(),
          p25: z.number(),
          p50: z.number(),
          p75: z.number(),
          p90: z.number(),
          p97: z.number(),
        })
      )
      .optional(),
    height: z
      .array(
        z.object({
          ageInDays: z.number().nonnegative(),
          p3: z.number(),
          p10: z.number(),
          p25: z.number(),
          p50: z.number(),
          p75: z.number(),
          p90: z.number(),
          p97: z.number(),
        })
      )
      .optional(),
    headCircumference: z
      .array(
        z.object({
          ageInDays: z.number().nonnegative(),
          p3: z.number(),
          p10: z.number(),
          p25: z.number(),
          p50: z.number(),
          p75: z.number(),
          p90: z.number(),
          p97: z.number(),
        })
      )
      .optional(),
  }),
});

// Inferred types
export type GrowthRecordDb = z.infer<typeof GrowthRecordDbSchema>;
export type GrowthRecordApi = z.infer<typeof GrowthRecordApiSchema>;
export type CreateGrowthRecordRequest = z.infer<
  typeof CreateGrowthRecordRequestSchema
>;
export type UpdateGrowthRecordRequest = z.infer<
  typeof UpdateGrowthRecordRequestSchema
>;
export type GrowthFilters = z.infer<typeof GrowthFiltersSchema>;
export type GrowthRecordResponse = z.infer<typeof GrowthRecordResponseSchema>;
export type GrowthRecordsResponse = z.infer<typeof GrowthRecordsResponseSchema>;
export type GrowthChartData = z.infer<typeof GrowthChartDataSchema>;
