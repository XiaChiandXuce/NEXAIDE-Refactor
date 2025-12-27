import { BaseProvider } from './base';
import { LLMRequest } from '../types';

export class QwenProvider extends BaseProvider {
    readonly id = 'qwen-max'; // Default model
    private apiKey: string = '';
    private baseUrl: string = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

    constructor() {
        super();
    }

    async initialize(): Promise<void> {
        this.apiKey = this.getApiKey('DASHSCOPE_API_KEY');
    }

    async chat(request: LLMRequest): Promise<string> {
        const response = await this.makeRequest(request, false);
        const data = await response.json() as any;
        if (!response.ok) {
            throw new Error(`Qwen API Error: ${data.error?.message || response.statusText}`);
        }
        return data.choices[0].message.content;
    }

    async streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<void> {
        const response = await this.makeRequest(request, true);

        if (!response.ok) {
            const data = await response.json() as any;
            throw new Error(`Qwen API Error: ${data.error?.message || response.statusText}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        // Use standard Web Streams API (available in modern Node and VS Code)
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the last incomplete line

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(trimmed.slice(6)) as any;
                            const content = data.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.error('Failed to parse stream chunk:', e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    private async makeRequest(request: LLMRequest, stream: boolean): Promise<Response> {
        if (!this.apiKey) {
            await this.initialize();
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const body = {
            model: this.id,
            messages: request.messages,
            stream: stream,
            temperature: request.temperature ?? 0.7
        };

        return fetch(this.baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: request.abortSignal
        });
    }
}
