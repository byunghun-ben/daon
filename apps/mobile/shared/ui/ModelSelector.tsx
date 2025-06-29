import { AIModel, MODEL_PROVIDER_MAP } from "@daon/shared";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
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
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          AI Model: {currentModel?.label || selectedModel}
        </Text>
        <Text style={[styles.provider, { color: theme.colors.text.secondary }]}>
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
          dropdownIconColor={theme.colors.text.primary}
          mode={Platform.OS === "android" ? "dropdown" : undefined}
          enabled={true}
        >
          {AVAILABLE_MODELS.map((model) => (
            <Picker.Item
              key={model.value}
              label={model.label}
              value={model.value}
              color={
                Platform.OS === "ios" ? theme.colors.text.primary : undefined
              }
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  provider: {
    fontSize: 10,
    fontWeight: "400",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "white",
  },
  picker: {
    height: Platform.OS === "ios" ? 120 : 50,
    width: "100%",
  },
  iosPicker: {
    backgroundColor: "transparent",
  },
});
