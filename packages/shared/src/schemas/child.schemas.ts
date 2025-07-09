import z from "zod/v4";
import { GENDERS, GUARDIAN_ROLES } from "../constants";

// Base child schema with database fields (실제 DB 구조에 맞춤)
export const ChildDbSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // DATE 타입
  gender: z.enum(Object.values(GENDERS)).nullable(),
  photo_url: z.url().nullable(),
  birth_weight: z.number().positive().nullable(), // DECIMAL(5,2), kg 단위
  birth_height: z.number().positive().nullable(), // DECIMAL(5,2), cm 단위
  owner_id: z.uuid(), // 소유자 ID (NOT NULL)
  invite_code: z.string().nullable(), // 초대 코드
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
});

// API response schema with frontend fields (camelCase)
export const ChildApiSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(Object.values(GENDERS)).nullable(),
  photoUrl: z.url().nullable(),
  birthWeight: z.number().positive().nullable(),
  birthHeight: z.number().positive().nullable(),
  ownerId: z.uuid(),
  inviteCode: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

// Request schemas (camelCase for frontend)
export const CreateChildRequestSchema = z.object({
  name: z
    .string()
    .min(1, "이름은 필수 입력 항목입니다.")
    .max(100, "이름은 최대 100자까지 입력할 수 있습니다."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다."),
  gender: z.enum(Object.values(GENDERS)).nullable(),
  photoUrl: z.url().nullable().optional(),
  birthWeight: z.number().positive().nullable().optional(),
  birthHeight: z.number().positive().nullable().optional(),
  role: z.enum(Object.values(GUARDIAN_ROLES)).default(GUARDIAN_ROLES.OWNER),
});

export const UpdateChildRequestSchema = CreateChildRequestSchema.partial();

// Join child request schema
const GUARDIAN_ROLES_WITHOUT_OWNER = Object.values(GUARDIAN_ROLES).filter(
  (role) => role !== "owner",
);
export const JoinChildRequestSchema = z.object({
  inviteCode: z.string().min(1),
  role: z.enum(GUARDIAN_ROLES_WITHOUT_OWNER).default(GUARDIAN_ROLES.GUARDIAN),
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
