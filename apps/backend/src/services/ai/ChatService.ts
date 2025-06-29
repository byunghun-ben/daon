import type { ChatStreamChunk } from "@daon/shared";
import { logger } from "../../utils/logger";
import { AIProviderFactory } from "./AIProviderFactory";
import type { AIStreamRequest } from "./interfaces/AIProvider";

export interface ChatServiceRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  provider?: "anthropic" | "openai" | "azure-openai"; // Optional provider override
}

export class ChatService {
  static async streamChat(
    request: ChatServiceRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    try {
      // Determine which provider to use
      let provider = AIProviderFactory.getProvider("anthropic"); // Default

      if (request.provider) {
        // Use specified provider
        provider = AIProviderFactory.getProvider(request.provider);
      } else if (request.model) {
        // Auto-detect provider based on model
        provider = AIProviderFactory.getProviderByModel(request.model);
      }

      logger.info(`Using AI provider: ${provider.name}`, {
        model: request.model,
        provider: provider.name,
        messageCount: request.messages.length,
      });

      const aiRequest: AIStreamRequest = {
        messages: request.messages,
        model: request.model,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
      };

      await provider.streamChat(
        aiRequest,
        onChunk,
        (response) => {
          logger.info(`Chat completed with ${provider.name}`, {
            id: response.id,
            contentLength: response.content.length,
            finishReason: response.finishReason,
          });
          onComplete();
        },
        onError,
      );
    } catch (error) {
      logger.error("ChatService error:", error);
      onError(
        error instanceof Error ? error : new Error("Unknown ChatService error"),
      );
    }
  }

  static async healthCheck(): Promise<{
    status: string;
    providers: Record<string, { status: string; models: string[] }>;
  }> {
    const providers = AIProviderFactory.getAllProviders();
    const results: Record<string, { status: string; models: string[] }> = {};

    for (const [type, provider] of providers) {
      try {
        const health = await provider.healthCheck();
        results[type] = health;
      } catch (error) {
        results[type] = {
          status: "error",
          models: [],
        };
        logger.warn(`Provider ${type} health check failed:`, error);
      }
    }

    const overallStatus = Object.values(results).some((r) => r.status === "ok")
      ? "ok"
      : "error";

    return {
      status: overallStatus,
      providers: results,
    };
  }

  static getAvailableModels(): Record<string, string[]> {
    return AIProviderFactory.getAvailableModels();
  }
}
