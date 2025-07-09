import { ChatInput, ChatMessage } from "@/features/chat/components";
import { useChatStream } from "@/shared/api/chat";
import { ModelSelector } from "@/shared/ui/ModelSelector";
import type { AIModel, ChatMessage as ChatMessageType } from "@daon/shared";
import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";

const INITIAL_MESSAGE: ChatMessageType = {
  id: "initial",
  role: "assistant",
  content: "안녕하세요! 육아에 관한 질문이 있으시면 언제든 물어보세요.",
  timestamp: new Date().toISOString(),
};

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    "claude-3-7-sonnet-latest",
  );

  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearError,
    cancelStream,
  } = useChatStream([INITIAL_MESSAGE], selectedModel);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch {
      Alert.alert(
        "오류",
        "메시지를 전송하는데 실패했습니다. 다시 시도해주세요.",
        [{ text: "확인" }],
      );
    }
  };

  // Show error alert if there's an error
  React.useEffect(() => {
    if (error) {
      Alert.alert("연결 오류", `AI 서비스에 연결할 수 없습니다.\n\n${error}`, [
        { text: "다시 시도", onPress: clearError },
        {
          text: "취소",
          onPress: () => {
            clearError();
            cancelStream();
          },
        },
      ]);
    }
  }, [error, clearError, cancelStream]);

  // Auto scroll to bottom when new messages are added
  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="px-4 pt-2 bg-white">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            isStreaming ? "AI가 응답 중입니다..." : "메시지를 입력하세요..."
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

