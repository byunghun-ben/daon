import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useState } from "react";
import {
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { cn } from "../../../shared/lib/utils/cn";

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
    <View className="px-4 py-3 bg-white border-t border-gray-200">
      <View className="flex-row items-end bg-gray-100 rounded-3xl px-4 py-2 min-h-[40px]">
        <TextInput
          className={cn(
            "flex-1 text-base leading-5 text-black max-h-[100px] mr-2",
            Platform.OS === "ios" ? "pt-2 pb-2" : "pt-1 pb-1"
          )}
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
          className={cn(
            "w-8 h-8 rounded-2xl items-center justify-center mb-0.5",
            canSend ? "bg-blue-500" : "bg-gray-400"
          )}
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

