import { createLLMParser } from './parsers';
import axios from 'axios';
import { StreamCallbacks } from './types';

export class LLMClient {
    private abortController: AbortController | null = null;

    /**
     * Stream chat completion using robust SSE parsing
     */
    public async streamChat(
        url: string,
        apiKey: string,
        payload: any,
        callbacks: StreamCallbacks,
        signal?: AbortSignal
    ): Promise<void> {
        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'text/event-stream',
                    // Specific headers for DashScope/OpenAI compatibility
                    'X-DashScope-SSE': 'enable'
                },
                responseType: 'stream',
                signal: signal
            });

            // Use the extracted parser factory
            const parser = createLLMParser(callbacks.onToken);

            // Stream processing
            response.data.on('data', (chunk: Buffer) => {
                parser.feed(chunk.toString('utf-8'));
            });

            response.data.on('end', () => {
                callbacks.onDone();
            });

            response.data.on('error', (err: any) => {
                callbacks.onError(err);
            });

        } catch (error: any) {
            if (axios.isCancel(error)) {
                // User aborted, strictly not an error
                return;
            }
            callbacks.onError(error);
        }
    }
}
