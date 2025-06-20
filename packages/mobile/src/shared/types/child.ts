import { z } from "zod";

export const ChildSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthDate: z.date(),
  gender: z.enum(["male", "female"]),
  photo: z.string().optional(),
  birthWeight: z.number().optional(),
  birthHeight: z.number().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Child = z.infer<typeof ChildSchema>;