import { z } from "zod";

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

// Child Profile Form Schema
export const ChildFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "아이의 이름을 입력해주세요")
      .min(2, "이름은 2자 이상 입력해주세요")
      .max(100, "이름은 100자 이하로 입력해주세요"),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    expectedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    gender: z.enum(["male", "female"]).optional(),
    photoUrl: z.string().url().optional(),
    birthWeight: z.number().positive("출생 체중은 양수여야 합니다").optional(),
    birthHeight: z.number().positive("출생 신장은 양수여야 합니다").optional(),
  })
  .refine((data) => data.birthDate || data.expectedDate, {
    message: "출생일 또는 출산예정일 중 하나는 필수입니다",
    path: ["birthDate"],
  });

export type ChildFormData = z.infer<typeof ChildFormSchema>;

// Join Child Form Schema
export const JoinChildFormSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "초대 코드를 입력해주세요")
    .min(6, "초대 코드는 6자 이상이어야 합니다"),
});

export type JoinChildFormData = z.infer<typeof JoinChildFormSchema>;
