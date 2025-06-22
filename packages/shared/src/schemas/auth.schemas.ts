import z from "zod/v4";

// User schemas
export const UserDbSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1).max(100),
  registration_status: z.enum(["pending", "completed"]),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const UserApiSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1).max(100),
  registrationStatus: z.enum(["pending", "completed"]),
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
