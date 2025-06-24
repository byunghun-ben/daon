import { GENDERS } from "@daon/shared";
import { z } from "zod/v4";

// Child Profile Form Schema
export const ChildFormSchema = z.object({
  name: z
    .string()
    .min(1, "아이의 이름을 입력해주세요")
    .min(2, "이름은 2자 이상 입력해주세요")
    .max(100, "이름은 100자 이하로 입력해주세요"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(Object.values(GENDERS)).nullable(),
  photoUrl: z.url().nullable(),
  birthWeight: z.number().positive("출생 체중은 양수여야 합니다").nullable(),
  birthHeight: z.number().positive("출생 신장은 양수여야 합니다").nullable(),
});

export type ChildFormData = z.infer<typeof ChildFormSchema>;
