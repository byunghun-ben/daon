import { useAuthStore } from "@/shared/store/authStore";
import type {
  AIModel,
  ChatMessage,
  ChatStreamChunk,
  ChatStreamRequest,
} from "@daon/shared";
import { MODEL_PROVIDER_MAP } from "@daon/shared";
import { useCallback, useRef, useState } from "react";
import { ChatStreamError, chatApi } from "../api";

interface UseChatStreamState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  isConnected: boolean;
}

interface UseChatStreamReturn extends UseChatStreamState {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  cancelStream: () => void;
}

export const useChatStream = (
  initialMessages: ChatMessage[] = [],
  selectedModel: AIModel = "claude-3-7-sonnet-latest",
): UseChatStreamReturn => {
  const [state, setState] = useState<UseChatStreamState>({
    messages: initialMessages,
    isStreaming: false,
    error: null,
    isConnected: true,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentResponseRef = useRef<ChatMessage | null>(null);
  const { signOut } = useAuthStore();

  const updateState = useCallback((updates: Partial<UseChatStreamState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setState((prev) => {
      const messages = [...prev.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        messages[messages.length - 1] = {
          ...lastMessage,
          content,
          timestamp: new Date().toISOString(),
        };
      }
      return { ...prev, messages };
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (state.isStreaming) return;

      // Clear any previous error
      updateState({ error: null });

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Prepare request - filter out empty content messages
      const request: ChatStreamRequest = {
        messages: [...state.messages, userMessage]
          .filter((msg) => msg.content.trim().length > 0) // Filter out empty messages
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        model: selectedModel,
        provider: MODEL_PROVIDER_MAP[selectedModel],
        maxTokens: 1000,
        temperature: 0.7,
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Start streaming
      updateState({ isStreaming: true, error: null });

      // Initialize assistant response (but don't add to messages yet)
      currentResponseRef.current = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      let assistantMessageAdded = false;

      try {
        await chatApi.streamChat(
          request,
          // onChunk
          (chunk: ChatStreamChunk) => {
            if (chunk.type === "text") {
              // If this is the first chunk, add the assistant message to the list
              if (currentResponseRef.current && !assistantMessageAdded) {
                addMessage(currentResponseRef.current);
                assistantMessageAdded = true;
              }
              updateLastMessage(chunk.content || "");
            }
          },
          // onComplete
          () => {
            updateState({ isStreaming: false });
            currentResponseRef.current = null;
            assistantMessageAdded = false;
          },
          // onError
          (error: ChatStreamError) => {
            // Handle authentication errors
            if (
              error.statusCode === 401 ||
              error.message.includes("Invalid JWT")
            ) {
              // JWT is invalid, redirect to login
              signOut();
              return;
            }

            updateState({
              isStreaming: false,
              error: error.message,
            });
            currentResponseRef.current = null;
            assistantMessageAdded = false;
          },
          // signal
          abortControllerRef.current.signal,
        );
      } catch (error) {
        // Handle authentication errors at the top level too
        if (error instanceof ChatStreamError) {
          if (
            error.statusCode === 401 ||
            error.message.includes("Invalid JWT")
          ) {
            signOut();
            return;
          }
        }

        updateState({
          isStreaming: false,
          error:
            error instanceof Error ? error.message : "Failed to send message",
        });
        currentResponseRef.current = null;
        assistantMessageAdded = false;
      }
    },
    [
      state.messages,
      state.isStreaming,
      addMessage,
      updateLastMessage,
      updateState,
      signOut,
      selectedModel,
    ],
  );

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    updateState({ isStreaming: false });
    currentResponseRef.current = null;
  }, [updateState]);

  return {
    ...state,
    sendMessage,
    clearMessages,
    clearError,
    cancelStream,
  };
};
