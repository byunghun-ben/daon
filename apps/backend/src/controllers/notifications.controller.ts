import { supabase } from "@/lib/supabase.js";
import { firebaseAdmin } from "@/services/firebase-admin.service.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import {
  CreateFcmTokenRequestSchema,
  DeleteFcmTokenRequestSchema,
  SendNotificationRequestSchema,
  SendTopicNotificationRequestSchema,
  type FcmTokenResponse,
  type FcmTokensResponse,
  type NotificationResponse,
} from "@daon/shared";
import { type RequestHandler } from "express";
import { z } from "zod/v4";

/**
 * Register or update FCM token
 */
export const registerToken: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      // Validate request body
      const validatedData = CreateFcmTokenRequestSchema.parse(req.body);
      const userId = req.user.id;
      const { token, platform, device_info } = validatedData;

      // Check if token already exists
      const { data: existingToken, error: fetchError } = await supabase
        .from("fcm_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("token", token)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116: not found
        throw fetchError;
      }

      let fcmToken;

      if (existingToken) {
        // Update existing token
        const { data, error } = await supabase
          .from("fcm_tokens")
          .update({
            platform,
            device_info: device_info ? JSON.parse(JSON.stringify(device_info)) : {},
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingToken.id)
          .select()
          .single();

        if (error) throw error;
        fcmToken = data;
      } else {
        // Register new token
        const { data, error } = await supabase
          .from("fcm_tokens")
          .insert({
            user_id: userId,
            token,
            platform,
            device_info: device_info ? JSON.parse(JSON.stringify(device_info)) : {},
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        fcmToken = data;
      }

      logger.info(`FCM token registered for user ${userId}`);
      const response: FcmTokenResponse = { 
        fcm_token: {
          id: fcmToken.id,
          user_id: fcmToken.user_id,
          token: fcmToken.token,
          platform: fcmToken.platform as "ios" | "android" | "web" | undefined,
          device_info: fcmToken.device_info as Record<string, unknown> | undefined,
          is_active: fcmToken.is_active ?? true,
          created_at: fcmToken.created_at ?? new Date().toISOString(),
          updated_at: fcmToken.updated_at ?? new Date().toISOString(),
        }
      };
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("FCM token registration error:", error);
      res.status(500).json({
        error: "Failed to register FCM token",
      });
    }
  },
);

/**
 * Unregister FCM token
 */
export const unregisterToken: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      // Validate request body
      const validatedData = DeleteFcmTokenRequestSchema.parse(req.body);
      const userId = req.user.id;
      const { token } = validatedData;

      const { error } = await supabase
        .from("fcm_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("token", token);

      if (error) throw error;

      logger.info(`FCM token unregistered for user ${userId}`);
      res.json({ message: "Token unregistered successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("FCM token unregistration error:", error);
      res.status(500).json({ error: "Failed to unregister token" });
    }
  },
);

/**
 * Get user's registered tokens
 */
export const getUserTokens: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from("fcm_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const response: FcmTokensResponse = { 
        fcm_tokens: (data ?? []).map(token => ({
          id: token.id,
          user_id: token.user_id,
          token: token.token,
          platform: token.platform as "ios" | "android" | "web" | undefined,
          device_info: token.device_info as Record<string, unknown> | undefined,
          is_active: token.is_active ?? true,
          created_at: token.created_at ?? new Date().toISOString(),
          updated_at: token.updated_at ?? new Date().toISOString(),
        }))
      };
      res.json(response);
    } catch (error) {
      logger.error("FCM tokens fetch error:", error);
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  },
);

/**
 * Send notification to specific user
 */
export const sendNotification: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      // Validate request body
      const validatedData = SendNotificationRequestSchema.parse(req.body);
      const { user_id, title, body, data, image_url } = validatedData;

      // Get user's active tokens
      const { data: tokens, error: tokensError } = await supabase
        .from("fcm_tokens")
        .select("token, platform")
        .eq("user_id", user_id)
        .eq("is_active", true);

      if (tokensError) throw tokensError;

      if (!tokens || tokens.length === 0) {
        const response: NotificationResponse = {
          success: false,
          message: "No active tokens found for user",
        };
        res.json(response);
        return;
      }

      // Construct FCM message
      const message = {
        notification: {
          title,
          body,
          ...(image_url && { imageUrl: image_url }),
        },
        data: data ?? {},
        tokens: tokens.map((t) => t.token),
      };

      // Send multicast message
      const fcmResponse = await firebaseAdmin
        .getMessaging()
        .sendEachForMulticast(message);

      // Handle failed tokens
      const failedTokens: string[] = [];
      fcmResponse.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx].token);
          logger.error(
            `Failed to send to token ${tokens[idx].token}:`,
            resp.error,
          );
        }
      });

      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await supabase
          .from("fcm_tokens")
          .update({ is_active: false })
          .in("token", failedTokens);
      }

      logger.info(
        `Notification sent to user ${user_id}: ${fcmResponse.successCount} success, ${fcmResponse.failureCount} failed`,
      );

      const response: NotificationResponse = {
        success: fcmResponse.successCount > 0,
        message: `Sent to ${fcmResponse.successCount} devices`,
        failed_tokens: failedTokens.length > 0 ? failedTokens : undefined,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("Notification send error:", error);
      res.status(500).json({
        error: "Failed to send notification",
      });
    }
  },
);

/**
 * Send notification to topic subscribers
 */
export const sendTopicNotification: RequestHandler = createAuthenticatedHandler(
  async (req, res) => {
    try {
      // Validate request body
      const validatedData = SendTopicNotificationRequestSchema.parse(req.body);
      const { topic, title, body, data, image_url } = validatedData;

      // Construct FCM message
      const message = {
        notification: {
          title,
          body,
          ...(image_url && { imageUrl: image_url }),
        },
        data: data ?? {},
        topic,
      };

      // Send topic message
      const messageId = await firebaseAdmin.getMessaging().send(message);

      logger.info(`Topic notification sent to ${topic}: ${messageId}`);

      const response: NotificationResponse = {
        success: true,
        message: `Notification sent to topic ${topic}`,
        message_id: messageId,
      };
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues,
        });
        return;
      }

      logger.error("Topic notification send error:", error);
      res.status(500).json({
        error: "Failed to send topic notification",
      });
    }
  },
);