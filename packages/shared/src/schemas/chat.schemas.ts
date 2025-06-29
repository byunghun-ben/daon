import * as z from "zod/v4";

// Chat message role
export const ChatRoleEnum = z.enum(["user", "assistant", "system"]);
export type ChatRole = z.infer<typeof ChatRoleEnum>;

// Base chat message schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleEnum,
  content: z.string(),
  timestamp: z.iso.datetime(),
});

// Chat message with metadata
export const ChatMessageWithMetaSchema = ChatMessageSchema.extend({
  metadata: z
    .object({
      tokens: z.number().optional(),
      model: z.string().optional(),
      finishReason: z.string().optional(),
    })
    .optional(),
});

// Chat conversation schema
export const ChatConversationSchema = z.object({
  id: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// API request/response schemas
export const ChatStreamRequestSchema = z.object({
  messages: z.array(ChatMessageSchema.pick({ role: true, content: true })),
  model: z.string().optional().default("claude-3-7-sonnet-latest"),
  maxTokens: z.number().optional().default(1000),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  provider: z.enum(["anthropic", "openai", "azure-openai"]).optional(),
});

export const ChatStreamChunkSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "done", "error"]),
  content: z.string().optional(),
  delta: z.string().optional(),
  error: z.string().optional(),
});

export const ChatStreamResponseSchema = z.object({
  id: z.string(),
  messages: z.array(ChatMessageWithMetaSchema),
  finished: z.boolean(),
});

// Type exports
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatMessageWithMeta = z.infer<typeof ChatMessageWithMetaSchema>;
export type ChatConversation = z.infer<typeof ChatConversationSchema>;
export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;
export type ChatStreamChunk = z.infer<typeof ChatStreamChunkSchema>;
export type ChatStreamResponse = z.infer<typeof ChatStreamResponseSchema>;
