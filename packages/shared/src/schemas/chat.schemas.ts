import * as z from "zod/v4";

// Chat message role
export const ChatRoleEnum = z.enum(["user", "assistant", "system"]);
export type ChatRole = z.infer<typeof ChatRoleEnum>;

// AI Models enum
export const AIModelEnum = z.enum([
  // Anthropic models
  "claude-3-7-sonnet-latest",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-3-opus-20240229",
  // OpenAI models
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
  // Azure OpenAI models
  "gpt-4.1",
]);
export type AIModel = z.infer<typeof AIModelEnum>;

// AI Providers enum
export const AIProviderEnum = z.enum(["anthropic", "openai", "azure-openai"]);
export type AIProvider = z.infer<typeof AIProviderEnum>;

// Model to provider mapping
export const MODEL_PROVIDER_MAP: Record<AIModel, AIProvider> = {
  "claude-3-7-sonnet-latest": "anthropic",
  "claude-3-sonnet-20240229": "anthropic",
  "claude-3-haiku-20240307": "anthropic",
  "claude-3-opus-20240229": "anthropic",
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-4-turbo": "openai",
  "gpt-3.5-turbo": "openai",
  "gpt-4.1": "azure-openai",
};

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
  model: AIModelEnum.optional().default("claude-3-7-sonnet-latest"),
  maxTokens: z.number().optional().default(1000),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  provider: AIProviderEnum.optional(),
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
