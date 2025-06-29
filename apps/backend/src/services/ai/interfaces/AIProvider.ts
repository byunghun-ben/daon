import type { ChatStreamChunk } from "@daon/shared";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIStreamRequest {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIStreamResponse {
  id: string;
  content: string;
  finishReason?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface AIProvider {
  readonly name: string;
  readonly supportedModels: string[];

  streamChat(
    request: AIStreamRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: (response: AIStreamResponse) => void,
    onError: (error: Error) => void,
  ): Promise<void>;

  healthCheck(): Promise<{ status: string; models: string[] }>;
}
