import { z } from "zod/v4";

export const JsonSchema = z.json();

export type Json = z.infer<typeof JsonSchema>;
