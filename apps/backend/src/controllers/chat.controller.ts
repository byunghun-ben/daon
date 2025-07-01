import { ChatService } from "@/services/ai/ChatService.js";
import { logger } from "@/utils/logger.js";
import type { ChatStreamChunk } from "@daon/shared";
import { ChatStreamRequestSchema } from "@daon/shared";
import type { Request, Response } from "express";

export const chatController = {
  streamChat: async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validatedData = ChatStreamRequestSchema.parse(req.body);
      const { messages, model, maxTokens, temperature, provider } =
        validatedData;

      // Set SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Cache-Control, Connection, Content-Type, Authorization",
      });

      // Generate unique conversation ID
      const conversationId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.info(`Starting chat stream: ${conversationId}`, {
        messageCount: messages.length,
        model,
      });

      await ChatService.streamChat(
        {
          messages,
          model,
          maxTokens,
          temperature,
          provider,
        },
        // onChunk
        (chunk: ChatStreamChunk) => {
          logger.info(`[Chunk] ${chunk.type}:`, {
            id: chunk.id,
            contentLength: chunk.content?.length ?? 0,
            deltaLength: chunk.delta?.length ?? 0,
          });
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
        // onComplete
        () => {
          logger.info(`Chat stream completed: ${conversationId}`);
          res.end();
        },
        // onError
        (error: Error) => {
          logger.error(`Chat stream error: ${conversationId}`, error);

          const errorChunk: ChatStreamChunk = {
            id: `${conversationId}_error`,
            type: "error",
            error: error.message || "AI service error",
          };
          res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
          res.end();
        },
      );
    } catch (error) {
      logger.error("Chat controller error:", error);

      // If headers already sent, we can't change status code
      if (res.headersSent) {
        const errorChunk: ChatStreamChunk = {
          id: `error_${Date.now()}`,
          type: "error",
          error:
            error instanceof Error ? error.message : "Internal server error",
        };
        res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
        res.end();
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : "Bad request",
          details: error instanceof Error ? error.message : undefined,
        });
      }
    }
  },

  // Health check for chat service
  healthCheck: (req: Request, res: Response): void => {
    try {
      const health = ChatService.healthCheck();

      res.json({
        ...health,
        service: "chat",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Chat health check error:", error);
      res.status(500).json({
        status: "error",
        service: "chat",
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Get available models
  getModels: (req: Request, res: Response): void => {
    try {
      const models = ChatService.getAvailableModels();

      res.json({
        status: "ok",
        models,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get models error:", error);
      res.status(500).json({
        status: "error",
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  },
};
