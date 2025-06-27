import { z } from "zod/v4";

export const SignInFormSchema = z.object({
  email: z
    .email("올바른 이메일 형식을 입력해주세요")
    .min(1, "이메일을 입력해주세요"),
  password: z
    .string()
    .min(6, "비밀번호는 6자 이상이어야 합니다")
    .min(1, "비밀번호를 입력해주세요"),
});

export type SignInFormSchemaType = z.infer<typeof SignInFormSchema>;

export const SignUpFormSchema = z
  .object({
    email: z
      .email("올바른 이메일 형식을 입력해주세요")
      .min(1, "이메일을 입력해주세요"),
    password: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .min(1, "비밀번호를 입력해주세요"),
    passwordConfirm: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다")
      .min(1, "비밀번호를 입력해주세요"),
    name: z.string().min(1, "이름을 입력해주세요"),
    phone: z.string().min(1, "전화번호를 입력해주세요"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignUpFormSchemaType = z.infer<typeof SignUpFormSchema>;
