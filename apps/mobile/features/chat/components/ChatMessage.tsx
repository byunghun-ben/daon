import type { ChatMessage as ChatMessageType } from "@daon/shared";
import React from "react";
import { Text, View } from "react-native";
import { cn } from "../../../shared/lib/utils/cn";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <View className={cn(
      "px-4 py-1 items-start",
      isUser && "items-end"
    )}>
      <View
        className={cn(
          "max-w-[80%] p-3 rounded-2xl min-w-[60px]",
          isUser && "bg-blue-500 rounded-br-sm",
          isAssistant && "bg-gray-200 rounded-bl-sm"
        )}
      >
        <Text
          className={cn(
            "text-base leading-5",
            isUser && "text-white",
            isAssistant && "text-black"
          )}
        >
          {message.content}
        </Text>
        <Text className={cn(
          "text-xs mt-1 text-gray-600",
          isUser && "text-white/50"
        )}>
          {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

