"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const parsers_1 = require("./parsers");
const axios_1 = __importDefault(require("axios"));
class LLMClient {
    abortController = null;
    /**
     * Stream chat completion using robust SSE parsing
     */
    async streamChat(url, apiKey, payload, callbacks, signal) {
        try {
            const response = await axios_1.default.post(url, payload, {
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
            const parser = (0, parsers_1.createLLMParser)(callbacks.onToken);
            // Stream processing
            response.data.on('data', (chunk) => {
                parser.feed(chunk.toString('utf-8'));
            });
            response.data.on('end', () => {
                callbacks.onDone();
            });
            response.data.on('error', (err) => {
                callbacks.onError(err);
            });
        }
        catch (error) {
            if (axios_1.default.isCancel(error)) {
                // User aborted, strictly not an error
                return;
            }
            callbacks.onError(error);
        }
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=llmClient.js.map