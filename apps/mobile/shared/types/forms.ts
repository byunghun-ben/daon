import { z } from "zod/v4";

// Activity Form Schema - simplified
export const ActivityFormSchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  activityType: z.enum(["feeding", "diaper", "sleep", "tummy_time", "custom"]),
  started_at: z.string().min(1, "시작 시간을 입력해주세요"),
  ended_at: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type ActivityFormData = z.infer<typeof ActivityFormSchema>;

// Milestone schema
const MilestoneSchema = z.object({
  type: z.enum([
    "first_smile",
    "first_step",
    "first_word",
    "first_tooth",
    "custom",
  ]),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  achievedAt: z.string().datetime(),
  childId: z.string().uuid(),
  diaryEntryId: z.string().uuid().optional(),
});

// Diary Form Schema
export const DiaryFormSchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요",
    ),
  content: z
    .string()
    .min(1, "일기 내용을 입력해주세요")
    .min(10, "일기 내용을 10자 이상 입력해주세요"),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  milestones: z.array(MilestoneSchema).optional(),
});

export type DiaryFormData = z.infer<typeof DiaryFormSchema>;

// Join Child Form Schema
export const JoinChildFormSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "초대 코드를 입력해주세요")
    .min(6, "초대 코드는 6자 이상이어야 합니다"),
});

export type JoinChildFormData = z.infer<typeof JoinChildFormSchema>;
