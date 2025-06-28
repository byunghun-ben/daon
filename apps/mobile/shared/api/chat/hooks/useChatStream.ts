import type {
  ChatMessage,
  ChatStreamChunk,
  ChatStreamRequest,
} from "@daon/shared";
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
): UseChatStreamReturn => {
  const [state, setState] = useState<UseChatStreamState>({
    messages: initialMessages,
    isStreaming: false,
    error: null,
    isConnected: true,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentResponseRef = useRef<ChatMessage | null>(null);

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

      // Prepare request
      const request: ChatStreamRequest = {
        messages: [...state.messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: "claude-3-7-sonnet-latest",
        maxTokens: 1000,
        temperature: 0.7,
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Start streaming
      updateState({ isStreaming: true, error: null });

      // Initialize assistant response
      currentResponseRef.current = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      addMessage(currentResponseRef.current);

      try {
        await chatApi.streamChat(
          request,
          // onChunk
          (chunk: ChatStreamChunk) => {
            if (chunk.type === "text") {
              updateLastMessage(chunk.content || "");
            }
          },
          // onComplete
          () => {
            updateState({ isStreaming: false });
            currentResponseRef.current = null;
          },
          // onError
          (error: ChatStreamError) => {
            updateState({
              isStreaming: false,
              error: error.message,
            });
            currentResponseRef.current = null;
          },
          // signal
          abortControllerRef.current.signal,
        );
      } catch (error) {
        updateState({
          isStreaming: false,
          error:
            error instanceof Error ? error.message : "Failed to send message",
        });
        currentResponseRef.current = null;
      }
    },
    [
      state.messages,
      state.isStreaming,
      addMessage,
      updateLastMessage,
      updateState,
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
