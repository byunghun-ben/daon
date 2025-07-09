import { AIModel, MODEL_PROVIDER_MAP } from "@daon/shared";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, Text, View } from "react-native";
import { theme } from "../config/theme";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

// All available models with display names
const AVAILABLE_MODELS: { value: AIModel; label: string }[] = [
  { value: "claude-3-7-sonnet-latest", label: "Claude 3.7 Sonnet (Latest)" },
  { value: "gpt-4.1", label: "GPT-4.1 (Azure)" },
];

// Provider display names
const PROVIDER_DISPLAY_NAMES = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  "azure-openai": "Azure OpenAI",
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
}) => {
  const currentModel = AVAILABLE_MODELS.find((m) => m.value === selectedModel);

  return (
    <View className="p-3 rounded-lg mb-2 bg-surface">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-xs font-semibold text-foreground">
          AI Model: {currentModel?.label || selectedModel}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {PROVIDER_DISPLAY_NAMES[MODEL_PROVIDER_MAP[selectedModel]]}
        </Text>
      </View>

      <View>
        <Picker
          selectedValue={selectedModel}
          onValueChange={(value, index) => {
            console.log("Model changed to:", value, "at index:", index);
            if (value && value !== selectedModel) {
              onModelChange(value as AIModel);
            }
          }}
          dropdownIconColor={theme.colors.text}
          mode={Platform.OS === "android" ? "dropdown" : undefined}
          enabled={true}
        >
          {AVAILABLE_MODELS.map((model) => (
            <Picker.Item
              key={model.value}
              label={model.label}
              value={model.value}
              color={
                Platform.OS === "ios" ? theme.colors.text : undefined
              }
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

