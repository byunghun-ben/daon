import z from "zod/v4";

// Base child schema with database fields (실제 DB 구조에 맞춤)
export const ChildDbSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // DATE 타입
  gender: z.enum(["male", "female"]), // NOT NULL, 'other' 제거
  photo_url: z.string().url().nullable(),
  birth_weight: z.number().positive().nullable(), // DECIMAL(5,2), kg 단위
  birth_height: z.number().positive().nullable(), // DECIMAL(5,2), cm 단위
  owner_id: z.uuid(), // 소유자 ID (NOT NULL)
  invite_code: z.string().nullable(), // 초대 코드
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// API response schema with frontend fields (camelCase)
export const ChildApiSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female"]),
  photoUrl: z.string().url().nullable(),
  birthWeight: z.number().positive().nullable(),
  birthHeight: z.number().positive().nullable(),
  ownerId: z.uuid(),
  inviteCode: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Request schemas (camelCase for frontend)
export const CreateChildRequestSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female"]).optional(),
  photoUrl: z.url().optional(),
  birthWeight: z.number().positive().optional(),
  birthHeight: z.number().positive().optional(),
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
