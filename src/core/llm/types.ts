export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMRequest {
    messages: ChatMessage[];
    temperature?: number;
    stream?: boolean;
    abortSignal?: AbortSignal;
}

export interface ILLMProvider {
    /** 
     * Unique identifier for the provider adapter (e.g. "qwen", "openai") 
     */
    readonly id: string;

    /**
     * Initialize the provider (e.g. check API keys)
     */
    initialize(): Promise<void>;

    /**
     * Stream chat completion
     */
    streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<void>;

    /**
     * Non-streaming chat completion
     */
    chat(request: LLMRequest): Promise<string>;
}
