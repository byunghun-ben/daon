import type {
  AIProvider,
  AIStreamRequest,
  AIStreamResponse,
} from "@/services/ai/interfaces/AIProvider.js";
import { logger } from "@/utils/logger.js";
import type { ChatStreamChunk } from "@daon/shared";

interface OpenAIStreamResponse {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly supportedModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ];

  async streamChat(
    request: AIStreamRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: (response: AIStreamResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    const conversationId = `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info(`Starting OpenAI chat stream: ${conversationId}`, {
      messageCount: request.messages.length,
      model: request.model ?? this.supportedModels[0],
      maxTokens: request.maxTokens ?? 1000,
      temperature: request.temperature ?? 0.7,
    });

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: request.model ?? this.supportedModels[0],
            messages: request.messages,
            max_tokens: request.maxTokens ?? 1000,
            temperature: request.temperature ?? 0.7,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        logger.error(`OpenAI API error: ${conversationId}`, {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        logger.error(`No response body from OpenAI: ${conversationId}`);
        throw new Error("No response body received from OpenAI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let chunkIndex = 0;
      const startTime = Date.now();

      logger.debug(`OpenAI stream started: ${conversationId}`);

      try {
        while (true) {
          const result = await reader.read();

          if (result.done) {
            logger.info(`OpenAI stream completed: ${conversationId}`, {
              totalChunks: chunkIndex,
              contentLength: fullContent.length,
              durationMs: Date.now() - startTime,
            });

            const response: AIStreamResponse = {
              id: conversationId,
              content: fullContent,
              finishReason: "stop",
            };
            onComplete(response);
            break;
          }

          buffer += decoder.decode(result.value as ArrayBuffer, {
            stream: true,
          });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                logger.debug(`OpenAI stream done signal: ${conversationId}`);

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

              try {
                const parsed = JSON.parse(data) as OpenAIStreamResponse;
                chunkIndex++;

                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent && typeof deltaContent === "string") {
                  fullContent += deltaContent;

                  logger.debug(`OpenAI text delta: ${conversationId}`, {
                    chunkIndex,
                    deltaLength: deltaContent.length,
                    totalLength: fullContent.length,
                    elapsedMs: Date.now() - startTime,
                  });

                  const deltaChunk: ChatStreamChunk = {
                    id: `${conversationId}_${chunkIndex}`,
                    type: "text",
                    content: fullContent,
                    delta: deltaContent,
                  };
                  onChunk(deltaChunk);
                }
              } catch (parseError) {
                logger.warn(`OpenAI parse error: ${conversationId}`, {
                  data: data.substring(0, 100),
                  error:
                    parseError instanceof Error
                      ? parseError.message
                      : "Unknown error",
                });
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      logger.error(`OpenAI streaming error: ${conversationId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      onError(
        error instanceof Error ? error : new Error("Unknown OpenAI error"),
      );
    }
  }

  healthCheck(): { status: string; models: string[] } {
    try {
      logger.info("OpenAI health check started");

      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      logger.info("OpenAI health check passed", {
        modelsCount: this.supportedModels.length,
      });

      return {
        status: "ok",
        models: this.supportedModels,
      };
    } catch (error) {
      logger.error("OpenAI health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(
        `OpenAI health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
