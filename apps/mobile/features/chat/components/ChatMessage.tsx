import type { ChatMessage as ChatMessageType } from "@daon/shared";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View
        style={[
          styles.bubble,
          isUser && styles.userBubble,
          isAssistant && styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser && styles.userText,
            isAssistant && styles.assistantText,
          ]}
        >
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: "flex-start",
  },
  userContainer: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    minWidth: 60,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#000000",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    color: "#666666",
  },
  userTimestamp: {
    color: "#FFFFFF80",
  },
});
