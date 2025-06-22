import z from "zod/v4";

// User schemas (실제 DB 구조에 맞춤)
export const UserDbSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  phone: z.string().nullable(),
  registration_status: z.string().default("incomplete"),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const UserApiSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
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

// Auth response schemas
export const AuthResponseSchema = z.object({
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number(),
    token_type: z.string(),
  }),
  user: UserApiSchema,
});

export const UserResponseSchema = z.object({
  user: UserApiSchema,
});

// Inferred types
export type UserDb = z.infer<typeof UserDbSchema>;
export type UserApi = z.infer<typeof UserApiSchema>;
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
