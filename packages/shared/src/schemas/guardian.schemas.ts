import z from "zod/v4";

// Child guardians 테이블 스키마 (실제 DB 구조에 맞춤)
export const ChildGuardianDbSchema = z.object({
  id: z.uuid(),
  child_id: z.uuid(),
  user_id: z.uuid(),
  role: z.enum(["owner", "guardian", "viewer"]).default("guardian"),
  invited_at: z.iso.datetime(),
  accepted_at: z.iso.datetime().nullable(),
  created_at: z.iso.datetime(),
});

export const ChildGuardianApiSchema = z.object({
  id: z.uuid(),
  childId: z.uuid(),
  userId: z.uuid(),
  role: z.enum(["owner", "guardian", "viewer"]).default("guardian"),
  invitedAt: z.iso.datetime(),
  acceptedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  user: z.object({
    id: z.uuid(),
    name: z.string().nullable(),
    email: z.email(),
    avatarUrl: z.string().url().nullable(),
  }),
});

// Request schemas
export const InviteGuardianRequestSchema = z.object({
  childId: z.uuid(),
  email: z.email(),
  role: z.enum(["guardian", "viewer"]).default("guardian"),
});

export const AcceptInviteRequestSchema = z.object({
  inviteCode: z.string().min(1),
});

export const UpdateGuardianRoleRequestSchema = z.object({
  role: z.enum(["guardian", "viewer"]),
});

// Response schemas
export const GuardianResponseSchema = z.object({
  guardian: ChildGuardianApiSchema,
});

export const GuardiansResponseSchema = z.object({
  guardians: z.array(ChildGuardianApiSchema),
});

// Inferred types
export type ChildGuardianDb = z.infer<typeof ChildGuardianDbSchema>;
export type ChildGuardianApi = z.infer<typeof ChildGuardianApiSchema>;
export type InviteGuardianRequest = z.infer<typeof InviteGuardianRequestSchema>;
export type AcceptInviteRequest = z.infer<typeof AcceptInviteRequestSchema>;
export type UpdateGuardianRoleRequest = z.infer<
  typeof UpdateGuardianRoleRequestSchema
>;
export type GuardianResponse = z.infer<typeof GuardianResponseSchema>;
export type GuardiansResponse = z.infer<typeof GuardiansResponseSchema>;
