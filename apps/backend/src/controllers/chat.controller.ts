import Anthropic from "@anthropic-ai/sdk";
import { ChatStreamChunk, ChatStreamRequestSchema } from "@daon/shared";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const chatController = {
  async streamChat(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = ChatStreamRequestSchema.parse(req.body);
      const { messages, model, maxTokens, temperature } = validatedData;

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

      try {
        // Convert messages to Anthropic format
        const anthropicMessages: Anthropic.MessageParam[] = messages
          .filter((msg) => msg.role !== "system")
          .map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

        // Find system message if exists
        const systemMessage = messages.find((msg) => msg.role === "system");

        // Create streaming request to Anthropic
        const stream = await anthropic.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: anthropicMessages,
          ...(systemMessage && { system: systemMessage.content }),
          stream: true,
        });

        let fullContent = "";
        let chunkIndex = 0;

        // Process streaming response
        for await (const chunk of stream) {
          chunkIndex++;

          if (chunk.type === "content_block_start") {
            // Start of content block
            const startChunk: ChatStreamChunk = {
              id: `${conversationId}_${chunkIndex}`,
              type: "text",
              content: "",
              delta: "",
            };
            res.write(`data: ${JSON.stringify(startChunk)}\n\n`);
          } else if (chunk.type === "content_block_delta") {
            // Content delta (incremental text)
            if (chunk.delta.type === "text_delta") {
              const deltaText = chunk.delta.text;
              fullContent += deltaText;

              const deltaChunk: ChatStreamChunk = {
                id: `${conversationId}_${chunkIndex}`,
                type: "text",
                content: fullContent,
                delta: deltaText,
              };
              res.write(`data: ${JSON.stringify(deltaChunk)}\n\n`);
            }
          } else if (chunk.type === "message_stop") {
            // End of message
            break;
          }
        }

        // Send completion signal
        const doneChunk: ChatStreamChunk = {
          id: `${conversationId}_done`,
          type: "done",
          content: fullContent,
        };
        res.write(`data: ${JSON.stringify(doneChunk)}\n\n`);

        logger.info(`Chat stream completed: ${conversationId}`, {
          totalChunks: chunkIndex,
          contentLength: fullContent.length,
        });
      } catch (anthropicError) {
        logger.error(`Anthropic API error: ${conversationId}`, anthropicError);

        if (anthropicError instanceof Anthropic.AnthropicError) {
          const errorChunk: ChatStreamChunk = {
            id: `${conversationId}_error`,
            type: "error",
            error: anthropicError.message || "AI service error",
          };
          res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
        }
      }

      res.end();
    } catch (error) {
      logger.error("Chat stream error:", error);

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
  async healthCheck(req: Request, res: Response) {
    try {
      // Simple test to verify Anthropic API is accessible
      const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

      res.json({
        status: "ok",
        service: "chat",
        anthropic: {
          configured: hasApiKey,
          available: hasApiKey ? "unknown" : false,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Chat health check error:", error);
      res.status(500).json({
        status: "error",
        service: "chat",
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
};
