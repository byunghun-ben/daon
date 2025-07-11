import { z } from "zod/v4";

// Platform enum
export const PlatformSchema = z.enum(["ios", "android", "web"]);
export type Platform = z.infer<typeof PlatformSchema>;

// FCM Token schemas
export const FcmTokenSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string().min(1),
  platform: PlatformSchema.optional(),
  device_info: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateFcmTokenRequestSchema = z.object({
  token: z.string().min(1),
  platform: PlatformSchema,
  device_info: z.record(z.string(), z.unknown()).optional(),
});

export const DeleteFcmTokenRequestSchema = z.object({
  token: z.string().min(1),
});

// Notification sending schemas
export const SendNotificationRequestSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.string()).optional(),
  image_url: z.string().url().optional(),
});

export const SendTopicNotificationRequestSchema = z.object({
  topic: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.string()).optional(),
  image_url: z.string().url().optional(),
});

// Response schemas
export const FcmTokenResponseSchema = z.object({
  fcm_token: FcmTokenSchema,
});

export const FcmTokensResponseSchema = z.object({
  fcm_tokens: z.array(FcmTokenSchema),
});

export const NotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  message_id: z.string().optional(),
  failed_tokens: z.array(z.string()).optional(),
});

// Type exports
export type FcmToken = z.infer<typeof FcmTokenSchema>;
export type CreateFcmTokenRequest = z.infer<typeof CreateFcmTokenRequestSchema>;
export type DeleteFcmTokenRequest = z.infer<typeof DeleteFcmTokenRequestSchema>;
export type SendNotificationRequest = z.infer<typeof SendNotificationRequestSchema>;
export type SendTopicNotificationRequest = z.infer<typeof SendTopicNotificationRequestSchema>;
export type FcmTokenResponse = z.infer<typeof FcmTokenResponseSchema>;
export type FcmTokensResponse = z.infer<typeof FcmTokensResponseSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;