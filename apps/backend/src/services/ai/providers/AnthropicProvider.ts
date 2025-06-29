import Anthropic from "@anthropic-ai/sdk";
import type { ChatStreamChunk } from "@daon/shared";
import { logger } from "../../../utils/logger";
import type {
  AIProvider,
  AIStreamRequest,
  AIStreamResponse,
} from "../interfaces/AIProvider";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly supportedModels = [
    "claude-3-7-sonnet-latest",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229",
  ];

  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async streamChat(
    request: AIStreamRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: (response: AIStreamResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      // Convert messages to Anthropic format
      const anthropicMessages: Anthropic.MessageParam[] = request.messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Find system message if exists
      const systemMessage = request.messages.find(
        (msg) => msg.role === "system",
      );

      // Create streaming request
      const stream = await this.client.messages.create({
        model: request.model || this.supportedModels[0],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        messages: anthropicMessages,
        ...(systemMessage && { system: systemMessage.content }),
        stream: true,
      });

      let fullContent = "";
      let chunkIndex = 0;
      const conversationId = `anthropic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Process streaming response
      for await (const chunk of stream) {
        chunkIndex++;

        logger.info(`Anthropic chunk: ${conversationId}`, {
          chunkIndex,
          chunk,
        });

        switch (chunk.type) {
          case "content_block_start": {
            const startChunk: ChatStreamChunk = {
              id: `${conversationId}_${chunkIndex}`,
              type: "text",
              content: "",
              delta: "",
            };
            onChunk(startChunk);
            break;
          }
          case "content_block_delta": {
            if (chunk.delta.type !== "text_delta") {
              logger.warn(`Anthropic non-text delta`, {
                chunkIndex,
                delta: chunk.delta,
              });
              continue;
            }

            const deltaText = chunk.delta.text;
            fullContent += deltaText;

            const deltaChunk: ChatStreamChunk = {
              id: `${conversationId}_${chunkIndex}`,
              type: "text",
              content: fullContent,
              delta: deltaText,
            };
            onChunk(deltaChunk);
            break;
          }
          case "message_stop": {
            const doneChunk: ChatStreamChunk = {
              id: `${conversationId}_done`,
              type: "done",
              content: fullContent,
            };
            onChunk(doneChunk);

            const response: AIStreamResponse = {
              id: conversationId,
              content: fullContent,
              finishReason: "stop",
            };
            onComplete(response);
            return;
          }
          case "content_block_stop": {
            // Content block ended, but message might continue
            break;
          }
          default: {
            logger.warn(`Anthropic unknown chunk type`, {
              chunkIndex,
              chunk,
            });
            break;
          }
        }
      }
    } catch (error) {
      logger.error("Anthropic streaming error:", error);
      onError(
        error instanceof Error ? error : new Error("Unknown Anthropic error"),
      );
    }
  }

  async healthCheck(): Promise<{ status: string; models: string[] }> {
    try {
      // Simple health check - verify API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Anthropic API key not configured");
      }

      return {
        status: "ok",
        models: this.supportedModels,
      };
    } catch (error) {
      throw new Error(
        `Anthropic health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
