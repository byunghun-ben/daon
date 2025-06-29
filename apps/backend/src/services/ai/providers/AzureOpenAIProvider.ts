import type { ChatStreamChunk } from "@daon/shared";
import { AzureOpenAI } from "openai";
import { logger } from "../../../utils/logger";
import type {
  AIProvider,
  AIStreamRequest,
  AIStreamResponse,
} from "../interfaces/AIProvider";

export class AzureOpenAIProvider implements AIProvider {
  readonly name = "azure-openai";
  readonly supportedModels = ["gpt-4.1"];

  private client: AzureOpenAI;

  constructor() {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.OPENAI_API_VERSION || "2024-08-01-preview";

    if (!endpoint || !apiKey) {
      throw new Error("Azure OpenAI endpoint and API key are required");
    }

    this.client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1",
    });
  }

  async streamChat(
    request: AIStreamRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: (response: AIStreamResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void> {
    const conversationId = `azure_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    logger.info(`Starting Azure OpenAI chat stream: ${conversationId}`, {
      messageCount: request.messages.length,
      model: request.model || "gpt-4.1",
      maxTokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    });

    try {
      // Create streaming request
      const stream = await this.client.chat.completions.create({
        model: request.model || "gpt-4.1",
        messages: request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: true,
      });

      let fullContent = "";
      let chunkIndex = 0;
      let startTime = Date.now();

      logger.debug(`Azure OpenAI stream started: ${conversationId}`);

      // Process streaming response
      for await (const chunk of stream) {
        chunkIndex++;

        logger.debug(`Azure OpenAI chunk received: ${conversationId}`, {
          chunkIndex,
          elapsedMs: Date.now() - startTime,
        });

        const choice = chunk.choices[0];
        if (!choice) continue;

        if (choice.delta?.content) {
          const deltaText = choice.delta.content;
          fullContent += deltaText;

          logger.debug(`Azure OpenAI text delta: ${conversationId}`, {
            chunkIndex,
            deltaLength: deltaText.length,
            totalLength: fullContent.length,
            elapsedMs: Date.now() - startTime,
          });

          const deltaChunk: ChatStreamChunk = {
            id: `${conversationId}_${chunkIndex}`,
            type: "text",
            content: fullContent,
            delta: deltaText,
          };
          onChunk(deltaChunk);
        }

        // Check if streaming is finished
        if (choice.finish_reason) {
          logger.info(`Azure OpenAI stream completed: ${conversationId}`, {
            totalChunks: chunkIndex,
            contentLength: fullContent.length,
            durationMs: Date.now() - startTime,
            finishReason: choice.finish_reason,
            usage: chunk.usage,
          });

          const doneChunk: ChatStreamChunk = {
            id: `${conversationId}_done`,
            type: "done",
            content: fullContent,
          };
          onChunk(doneChunk);

          const response: AIStreamResponse = {
            id: conversationId,
            content: fullContent,
            finishReason: choice.finish_reason,
            usage: chunk.usage
              ? {
                  inputTokens: chunk.usage.prompt_tokens || 0,
                  outputTokens: chunk.usage.completion_tokens || 0,
                }
              : undefined,
          };
          onComplete(response);
          return;
        }
      }
    } catch (error) {
      logger.error(`Azure OpenAI streaming error: ${conversationId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      onError(
        error instanceof Error
          ? error
          : new Error("Unknown Azure OpenAI error"),
      );
    }
  }

  async healthCheck(): Promise<{ status: string; models: string[] }> {
    try {
      logger.info("Azure OpenAI health check started", {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
        apiVersion: process.env.OPENAI_API_VERSION,
      });

      // Verify environment variables are configured
      if (!process.env.AZURE_OPENAI_ENDPOINT) {
        throw new Error("Azure OpenAI endpoint not configured");
      }
      if (!process.env.AZURE_OPENAI_API_KEY) {
        throw new Error("Azure OpenAI API key not configured");
      }

      logger.info("Azure OpenAI health check passed", {
        modelsCount: this.supportedModels.length,
      });

      return {
        status: "ok",
        models: this.supportedModels,
      };
    } catch (error) {
      logger.error("Azure OpenAI health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(
        `Azure OpenAI health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
