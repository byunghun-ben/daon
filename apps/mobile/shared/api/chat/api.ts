import type { ChatStreamChunk, ChatStreamRequest } from "@daon/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventSource from "react-native-sse";
import { STORAGE_KEYS } from "../client";

const API_BASE_URL = __DEV__
  ? "http://localhost:3001/api/v1"
  : "https://api.daon.app/v1";

export class ChatStreamError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
    public statusCode?: number,
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
    return new Promise<void>(async (resolve, reject) => {
      let eventSource: EventSource | null = null;

      try {
        // Get auth token
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          throw new ChatStreamError("Authentication required");
        }

        console.log("[ChatAPI] Creating EventSource for streaming chat");

        // Create EventSource with POST request (react-native-sse supports this)
        eventSource = new EventSource(`${API_BASE_URL}/chat/stream`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: JSON.stringify(request),
          pollingInterval: 0, // Disable reconnections
        });

        // Handle abort signal
        if (signal) {
          signal.addEventListener("abort", () => {
            console.log("[ChatAPI] Aborting stream");
            if (eventSource) {
              eventSource.removeAllEventListeners();
              eventSource.close();
            }
            const error = new ChatStreamError("Request aborted");
            onError(error);
            reject(error);
          });
        }

        eventSource.addEventListener("open", () => {
          console.log("[ChatAPI] SSE connection opened");
        });

        eventSource.addEventListener("message", (event) => {
          try {
            console.log("[ChatAPI] Received SSE message:", event.data);

            // Skip empty data
            if (!event.data || event.data.trim() === "") {
              return;
            }

            const chunk: ChatStreamChunk = JSON.parse(event.data);
            onChunk(chunk);

            // Handle completion or error
            if (chunk.type === "done") {
              console.log("[ChatAPI] Stream completed");
              if (eventSource) {
                eventSource.removeAllEventListeners();
                eventSource.close();
              }
              onComplete();
              resolve();
            } else if (chunk.type === "error") {
              console.error("[ChatAPI] Stream error:", chunk.error);
              if (eventSource) {
                eventSource.removeAllEventListeners();
                eventSource.close();
              }
              throw new ChatStreamError(chunk.error || "Stream error");
            }
          } catch (parseError) {
            console.warn("Failed to parse SSE data:", event.data, parseError);
            // Continue processing other chunks - don't fail the entire stream
          }
        });

        eventSource.addEventListener("error", (event) => {
          console.error("[ChatAPI] SSE error:", event);
          if (eventSource) {
            eventSource.removeAllEventListeners();
            eventSource.close();
          }
          const error = new ChatStreamError("SSE connection error");
          onError(error);
          reject(error);
        });

        // Handle connection close
        eventSource.addEventListener("close", () => {
          console.log("[ChatAPI] SSE connection closed");
          // Only call onComplete if we haven't already resolved
          if (eventSource) {
            onComplete();
            resolve();
          }
        });
      } catch (error) {
        console.error("[ChatAPI] Setup error:", error);
        if (eventSource) {
          eventSource.removeAllEventListeners();
          eventSource.close();
        }
        const chatError =
          error instanceof ChatStreamError
            ? error
            : new ChatStreamError(
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
                error instanceof Error ? error : undefined,
              );
        onError(chatError);
        reject(chatError);
      }
    });
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
