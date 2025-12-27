import { ILLMProvider } from './types';
import { QwenProvider } from './providers/qwen';

export class LLMFactory {
    /**
     * Create an LLM provider instance based on the model ID.
     * @param modelId The model identifier (e.g. "qwen-max", "gpt-4")
     */
    static createProvider(modelId: string): ILLMProvider {
        // Normalize model ID
        const id = modelId.toLowerCase();

        // Router logic
        if (id.startsWith('qwen')) {
            return new QwenProvider();
        }

        // Future extensions:
        // if (id.startsWith('gpt')) return new OpenAIProvider();
        // if (id.startsWith('claude')) return new AnthropicProvider();
        // if (id.startsWith('gemini')) return new GeminiProvider();

        // Default fallback (or throw error)
        throw new Error(`Unsupported model: ${modelId}`);
    }
}
