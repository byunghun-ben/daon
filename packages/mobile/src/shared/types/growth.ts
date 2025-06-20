import { z } from "zod";

export const GrowthRecordSchema = z.object({
  id: z.string(),
  childId: z.string(),
  recordedAt: z.date(),
  weight: z.number().optional(),
  height: z.number().optional(),
  headCircumference: z.number().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GrowthRecord = z.infer<typeof GrowthRecordSchema>;