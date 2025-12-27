import { useState, useEffect } from "react";
import { vscode } from "../utils/vscode";

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const useExtension = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: 'Context initialized. Ready to chat.' }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const handleMessage = (message: any) => {
            switch (message.type) {
                case "APPEND_TEXT":
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === "assistant") {
                            return [...prev.slice(0, -1), { ...last, content: last.content + message.text }];
                        } else {
                            return [...prev, { role: "assistant", content: message.text }];
                        }
                    });
                    break;
                case "STATE_CHANGED":
                    setIsThinking(message.newState === "THINKING" || message.newState === "WRITING");
                    break;
                case "DONE":
                    setIsThinking(false);
                    break;
            }
        };

        // There is no `removeListener` in the simple `vscode.ts` wrapper usually, 
        // but the `useEffect` cleanup is good practice if `onMessage` supported it.
        // Assuming `vscode.onMessage` adds a global listener.
        // In the provided `vscode.ts`, it seems `onMessage` registers a listener on window.
        // We'll trust the wrapper or just act as the single source of truth.
        vscode.onMessage(handleMessage);

        // Cleanup if possible (depends on implementation of vscode.ts, usually it's fine for Singletons)
    }, []);

    const sendMessage = (text: string) => {
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        vscode.postMessage({ type: "SUBMIT_PROMPT", content: text });
    };

    return { messages, isThinking, sendMessage };
};
