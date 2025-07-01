import z from "zod/v4";

// User schemas (실제 DB 구조에 맞춤)
export const UserDbSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  avatar_url: z.url().nullable(),
  phone: z.string().nullable(),
  registration_status: z.string().default("incomplete"),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const UserApiSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  phone: z.string().nullable(),
  registrationStatus: z.string().default("incomplete"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Auth request schemas
export const SignUpRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(100),
});

export const SignInRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const UpdateUserProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
});

// Session schema
export const SessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
  token_type: z.string(),
});

// Auth response schemas
export const AuthResponseSchema = z.object({
  session: SessionSchema,
  user: UserApiSchema,
  needs_child_setup: z.boolean().optional(),
});

export const UserResponseSchema = z.object({
  user: UserApiSchema,
});

// Kakao OAuth schemas
export const KakaoLoginUrlRequestSchema = z.object({
  platform: z.enum(["mobile", "web"]).default("mobile"),
});

export const KakaoLoginUrlResponseSchema = z.object({
  loginUrl: z.string().url(),
  state: z.string(),
});

export const KakaoCallbackQuerySchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const KakaoUserInfoSchema = z.object({
  id: z.number(),
  connected_at: z
    .string()
    .optional()
    .describe("서비스에 연결 완료된 시각, UTC"),
  kakao_account: z.object({
    profile_nickname_needs_agreement: z.boolean().optional(),
    profile_image_needs_agreement: z.boolean().optional(),
    profile: z
      .object({
        nickname: z.string().optional(),
        thumbnail_image_url: z.string().url().optional(),
        profile_image_url: z.string().url().optional(),
        is_default_image: z.boolean().optional(),
      })
      .optional(),
    name_needs_agreement: z.boolean().optional(),
    name: z.string().optional(),
    email_needs_agreement: z.boolean().optional(),
    is_email_valid: z.boolean().optional(),
    is_email_verified: z.boolean().optional(),
    email: z.email().optional(),
    age_range_needs_agreement: z.boolean().optional(),
    age_range: z.string().optional(),
    birthday_needs_agreement: z.boolean().optional(),
    birthday: z.string().optional(),
    birthday_type: z.string().optional(),
    gender_needs_agreement: z.boolean().optional(),
    gender: z.string().optional(),
    phone_number_needs_agreement: z.boolean().optional(),
    phone_number: z.string().optional(),
    ci_needs_agreement: z.boolean().optional(),
    ci: z.string().optional(),
    ci_authenticated_at: z.string().optional(),
  }),
});

// Kakao Token Response Schema
export const KakaoTokenResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  id_token: z.string().optional(),
  expires_in: z.number(),
  refresh_token: z.string(),
  refresh_token_expires_in: z.number(),
  scope: z.string().optional(),
});

// Inferred types
export type UserDb = z.infer<typeof UserDbSchema>;
export type UserApi = z.infer<typeof UserApiSchema>;
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type KakaoLoginUrlRequest = z.infer<typeof KakaoLoginUrlRequestSchema>;
export type KakaoLoginUrlResponse = z.infer<typeof KakaoLoginUrlResponseSchema>;
export type KakaoCallbackQuery = z.infer<typeof KakaoCallbackQuerySchema>;
export type KakaoUserInfo = z.infer<typeof KakaoUserInfoSchema>;
export type KakaoTokenResponse = z.infer<typeof KakaoTokenResponseSchema>;
