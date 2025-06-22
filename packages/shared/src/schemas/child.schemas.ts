import z from "zod/v4";

// Base child schema with database fields (snake_case)
export const ChildDbSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string().min(1).max(100),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female", "other"]).optional(),
  photo_url: z.url().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// API response schema with frontend fields (camelCase)
export const ChildApiSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female", "other"]).optional(),
  photoUrl: z.url().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Request schemas (camelCase for frontend)
export const CreateChildRequestSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female", "other"]).optional(),
  photoUrl: z.url().optional(),
});

export const UpdateChildRequestSchema = CreateChildRequestSchema.partial();

// Join child request schema
export const JoinChildRequestSchema = z.object({
  inviteCode: z.string().min(1),
});

// Response schemas
export const ChildResponseSchema = z.object({
  child: ChildApiSchema,
});

export const ChildrenResponseSchema = z.object({
  children: z.array(ChildApiSchema),
});

// Inferred types
export type ChildDb = z.infer<typeof ChildDbSchema>;
export type ChildApi = z.infer<typeof ChildApiSchema>;
export type CreateChildRequest = z.infer<typeof CreateChildRequestSchema>;
export type UpdateChildRequest = z.infer<typeof UpdateChildRequestSchema>;
export type JoinChildRequest = z.infer<typeof JoinChildRequestSchema>;
export type ChildResponse = z.infer<typeof ChildResponseSchema>;
export type ChildrenResponse = z.infer<typeof ChildrenResponseSchema>;
