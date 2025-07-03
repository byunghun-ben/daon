import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "메시지를 입력하세요...",
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <IconSymbol
            size={20}
            name="arrow.up"
            color={canSend ? "#FFFFFF" : "#CCCCCC"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: "#000000",
    maxHeight: 100,
    marginRight: 8,
    ...Platform.select({
      ios: {
        paddingTop: 8,
        paddingBottom: 8,
      },
      android: {
        paddingTop: 4,
        paddingBottom: 4,
      },
    }),
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#CCCCCC",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
});
