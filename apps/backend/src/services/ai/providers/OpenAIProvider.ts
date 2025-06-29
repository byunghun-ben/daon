import type { ChatStreamChunk } from "@daon/shared";
import { logger } from "../../../utils/logger";
import type {
  AIProvider,
  AIStreamRequest,
  AIStreamResponse,
} from "../interfaces/AIProvider";

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
            model: request.model || this.supportedModels[0],
            messages: request.messages,
            max_tokens: request.maxTokens || 1000,
            temperature: request.temperature || 0.7,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("No response body received from OpenAI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let chunkIndex = 0;
      const conversationId = `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            const response: AIStreamResponse = {
              id: conversationId,
              content: fullContent,
              finishReason: "stop",
            };
            onComplete(response);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
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
                const parsed = JSON.parse(data);
                chunkIndex++;

                if (parsed.choices?.[0]?.delta?.content) {
                  const deltaText = parsed.choices[0].delta.content;
                  fullContent += deltaText;

                  const deltaChunk: ChatStreamChunk = {
                    id: `${conversationId}_${chunkIndex}`,
                    type: "text",
                    content: fullContent,
                    delta: deltaText,
                  };
                  onChunk(deltaChunk);
                }
              } catch (parseError) {
                logger.warn(
                  "Failed to parse OpenAI SSE data:",
                  data,
                  parseError,
                );
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      logger.error("OpenAI streaming error:", error);
      onError(
        error instanceof Error ? error : new Error("Unknown OpenAI error"),
      );
    }
  }

  async healthCheck(): Promise<{ status: string; models: string[] }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      return {
        status: "ok",
        models: this.supportedModels,
      };
    } catch (error) {
      throw new Error(
        `OpenAI health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
