import { z } from "zod";

export const FeedingDataSchema = z.object({
  type: z.enum(["breast", "bottle", "solid"]),
  amount: z.number().optional(),
  duration: z.number().optional(),
});

export const DiaperDataSchema = z.object({
  type: z.enum(["wet", "dirty", "both"]),
});

export const SleepDataSchema = z.object({
  startTime: z.date(),
  endTime: z.date().optional(),
  quality: z.enum(["good", "fair", "poor"]).optional(),
});

export const ActivityDataSchema = z.union([
  FeedingDataSchema,
  DiaperDataSchema,
  SleepDataSchema,
]);

export const ActivitySchema = z.object({
  id: z.string(),
  childId: z.string(),
  userId: z.string(),
  type: z.enum(["feeding", "diaper", "sleep", "tummy_time", "custom"]),
  timestamp: z.date(),
  data: ActivityDataSchema,
  notes: z.string().optional(),
});

export type FeedingData = z.infer<typeof FeedingDataSchema>;
export type DiaperData = z.infer<typeof DiaperDataSchema>;
export type SleepData = z.infer<typeof SleepDataSchema>;
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type Activity = z.infer<typeof ActivitySchema>;