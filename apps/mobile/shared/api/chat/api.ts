import type { ChatStreamChunk, ChatStreamRequest } from "@daon/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../client";

const API_BASE_URL = __DEV__
  ? "http://localhost:3001/api/v1"
  : "https://api.daon.app/v1";

export class ChatStreamError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "ChatStreamError";
  }
}

export const chatApi = {
  async streamChat(
    request: ChatStreamRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: () => void,
    onError: (error: ChatStreamError) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new ChatStreamError("Authentication required");
      }

      // Make streaming request
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ChatStreamError(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
        );
      }

      if (!response.body) {
        throw new ChatStreamError("No response body received");
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onComplete();
            break;
          }

          if (signal?.aborted) {
            throw new ChatStreamError("Request aborted");
          }

          // Decode and process chunks
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;

            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              try {
                const chunk: ChatStreamChunk = JSON.parse(data);
                onChunk(chunk);

                // Handle completion or error
                if (chunk.type === "done") {
                  onComplete();
                  return;
                } else if (chunk.type === "error") {
                  throw new ChatStreamError(chunk.error || "Stream error");
                }
              } catch (parseError) {
                console.warn("Failed to parse SSE data:", data, parseError);
                // Continue processing other chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof ChatStreamError) {
        onError(error);
      } else if (error instanceof Error) {
        onError(new ChatStreamError(error.message, error));
      } else {
        onError(new ChatStreamError("Unknown error occurred"));
      }
    }
  },

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/chat/health`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new ChatStreamError(
        error instanceof Error ? error.message : "Health check failed",
      );
    }
  },
};
