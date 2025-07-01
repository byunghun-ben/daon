import type { AIProvider } from "@/services/ai/interfaces/AIProvider.js";
import { AnthropicProvider } from "@/services/ai/providers/AnthropicProvider.js";
import { AzureOpenAIProvider } from "@/services/ai/providers/AzureOpenAIProvider.js";
import { OpenAIProvider } from "@/services/ai/providers/OpenAIProvider.js";

export type AIProviderType = "anthropic" | "openai" | "azure-openai";

export class AIProviderFactory {
  private static providers = new Map<AIProviderType, AIProvider>();

  static {
    // Register available providers
    this.providers.set("anthropic", new AnthropicProvider());
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("azure-openai", new AzureOpenAIProvider());
  }

  static getProvider(type: AIProviderType): AIProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`AI Provider '${type}' not found`);
    }
    return provider;
  }

  static getProviderByModel(model: string): AIProvider {
    for (const [, provider] of this.providers) {
      if (provider.supportedModels.includes(model)) {
        return provider;
      }
    }

    // Default to anthropic if model not found
    return this.getProvider("anthropic");
  }

  static getAllProviders(): Map<AIProviderType, AIProvider> {
    return new Map(this.providers);
  }

  static getAvailableModels(): Record<string, string[]> {
    const models: Record<string, string[]> = {};
    for (const [type, provider] of this.providers) {
      models[type] = provider.supportedModels;
    }
    return models;
  }

  static registerProvider(type: AIProviderType, provider: AIProvider): void {
    this.providers.set(type, provider);
  }
}
