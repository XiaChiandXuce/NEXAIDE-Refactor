"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLLMParser = createLLMParser;
/**
 * A robust stream parser for Server-Sent Events (SSE)
 * Handles chunk buffering and "data:" prefix stripping.
 */
function createLLMParser(onToken) {
    let buffer = '';
    return {
        feed(chunk) {
            buffer += chunk;
            const lines = buffer.split('\n');
            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(':'))
                    continue;
                if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]')
                        return;
                    try {
                        const data = JSON.parse(dataStr);
                        // Adapter logic: Handle OpenAI-compatible and DashScope formats
                        // Priority: 1. OpenAI delta, 2. DashScope output.text, 3. Generic content
                        const content = data.choices?.[0]?.delta?.content ||
                            data.output?.text ||
                            data.content ||
                            '';
                        if (content) {
                            onToken(content);
                        }
                    }
                    catch (e) {
                        // Ignore incomplete JSON
                    }
                }
            }
        },
        reset() {
            buffer = '';
        }
    };
}
//# sourceMappingURL=parsers.js.map