
import { createParser, ParsedEvent, ReconnectInterval, EventSourceParser } from 'eventsource-parser';

/**
 * Creates a configured EventSource parser for LLM streams
 */
export function createLLMParser(onToken: (text: string) => void): EventSourceParser {
    return createParser((event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
            if (event.data === '[DONE]') {
                return;
            }
            try {
                const data = JSON.parse(event.data);
                // Adapter logic: Handle OpenAI-compatible and DashScope formats
                // Priority: 1. OpenAI delta, 2. DashScope output.text, 3. Generic content
                const content =
                    data.choices?.[0]?.delta?.content ||
                    data.output?.text ||
                    data.content ||
                    '';

                if (content) {
                    onToken(content);
                }
            } catch (e) {
                // Ignore incomplete JSON chunks (common in raw streams)
            }
        }
    });
}
