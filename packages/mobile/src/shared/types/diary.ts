import { z } from "zod";

export const MilestoneSchema = z.object({
  type: z.enum(["first_smile", "first_step", "first_word", "custom"]),
  description: z.string(),
  achievedAt: z.date(),
});

export const DiaryEntrySchema = z.object({
  id: z.string(),
  childId: z.string(),
  userId: z.string(),	
  date: z.date(),
  content: z.string(),
  photos: z.array(z.string()),
  videos: z.array(z.string()),
  milestones: z.array(MilestoneSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Milestone = z.infer<typeof MilestoneSchema>;
export type DiaryEntry = z.infer<typeof DiaryEntrySchema>;