import z from "zod/v4";

// 공통 검증 스키마
export const emailSchema = z.email("올바른 이메일을 입력해주세요");
export const phoneSchema = z
  .string()
  .regex(/^010-?\d{4}-?\d{4}$/, "올바른 휴대폰 번호를 입력해주세요")
  .optional();

// 인증 검증
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이하여야 합니다"),
  phone: phoneSchema,
});

// 아이 정보 검증
export const createChildSchema = z.object({
  name: z
    .string()
    .min(1, "아이 이름을 입력해주세요")
    .max(20, "이름은 20자 이하여야 합니다"),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const now = new Date();
    return (
      birthDate <= now &&
      birthDate >= new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
    );
  }, "올바른 생년월일을 입력해주세요"),
  gender: z.enum(["MALE", "FEMALE"], "성별을 선택해주세요"),
  birthWeight: z.number().positive().max(10).optional(),
  birthHeight: z.number().positive().max(100).optional(),
});

// 활동 기록 검증
export const createActivitySchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  type: z.enum(["FEEDING", "DIAPER", "SLEEP", "TUMMY_TIME", "CUSTOM"]),
  timestamp: z.string().refine((date) => {
    const activityDate = new Date(date);
    const now = new Date();
    return activityDate <= now;
  }, "미래 시간은 선택할 수 없습니다"),
  notes: z.string().max(500, "메모는 500자 이하여야 합니다").optional(),
});

// 수유 데이터 검증
export const feedingDataSchema = z.object({
  type: z.enum(["BREAST", "BOTTLE", "SOLID"]),
  amount: z.number().positive().max(1000).optional(),
  duration: z.number().positive().max(480).optional(), // 8시간
  side: z.enum(["LEFT", "RIGHT", "BOTH"]).optional(),
});

// 수면 데이터 검증
export const sleepDataSchema = z
  .object({
    startTime: z.string(),
    endTime: z.string().optional(),
    quality: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
  })
  .refine((data) => {
    if (data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  }, "종료 시간은 시작 시간보다 늦어야 합니다");

// 일기 검증
export const createDiarySchema = z.object({
  childId: z.string().min(1, "아이를 선택해주세요"),
  date: z.string(),
  content: z
    .string()
    .min(1, "일기 내용을 입력해주세요")
    .max(2000, "일기는 2000자 이하여야 합니다"),
  photos: z
    .array(z.string().url())
    .max(10, "사진은 최대 10장까지 업로드할 수 있습니다")
    .optional(),
  videos: z
    .array(z.string().url())
    .max(3, "동영상은 최대 3개까지 업로드할 수 있습니다")
    .optional(),
});

// 성장 기록 검증
export const createGrowthRecordSchema = z
  .object({
    childId: z.string().min(1, "아이를 선택해주세요"),
    recordedAt: z.string(),
    weight: z
      .number()
      .positive()
      .max(50, "올바른 체중을 입력해주세요")
      .optional(),
    height: z
      .number()
      .positive()
      .max(200, "올바른 신장을 입력해주세요")
      .optional(),
    headCircumference: z
      .number()
      .positive()
      .max(100, "올바른 머리둘레를 입력해주세요")
      .optional(),
  })
  .refine((data) => {
    return data.weight ?? data.height ?? data.headCircumference;
  }, "체중, 신장, 머리둘레 중 하나 이상을 입력해주세요");

// 보호자 초대 검증
export const inviteGuardianSchema = z.object({
  email: emailSchema,
  childId: z.string().min(1, "아이를 선택해주세요"),
  permission: z.enum(["ADMIN", "VIEW_ONLY"]),
});

// 타입 추출
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type CreateChildData = z.infer<typeof createChildSchema>;
export type CreateActivityData = z.infer<typeof createActivitySchema>;
export type FeedingValidationData = z.infer<typeof feedingDataSchema>;
export type SleepValidationData = z.infer<typeof sleepDataSchema>;
export type CreateDiaryData = z.infer<typeof createDiarySchema>;
export type CreateGrowthRecordData = z.infer<typeof createGrowthRecordSchema>;
export type InviteGuardianData = z.infer<typeof inviteGuardianSchema>;
