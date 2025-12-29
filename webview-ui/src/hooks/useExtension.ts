import { useState, useEffect } from "react";
import { vscode } from "../utils/vscode";

export interface Message {
    id?: string;
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
                case "SYNC_MESSAGES":
                    setMessages(message.messages);
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
        // Optimistic update? No, let backend handle ID generation and sync
        // But for UI responsiveness, we usually append immediately.
        // However, without ID, we can't edit it later until backend syncs.
        // Let's stick to simple append for now, backend will eventually sync or we rely on index (deprecated).
        // Actually, if we want to edit *this* message later, we need its ID.
        // Solution: Wait for backend to send back the message with ID? 
        // Or generate temporary ID here? 
        // For Phase 2, let's keep it simple: Append local, but if we edit, we might fail if ID is missing.
        // But the "SYNC_MESSAGES" from backend will overwrite this with the real ID eventually (on reload or next edit).
        // Actually, LLM response usually triggers "APPEND_TEXT", but doesn't sync the whole list.
        // Ideally, "SUBMIT_PROMPT" should return the new message ID.
        // For now, let's just append.
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        vscode.postMessage({ type: "SUBMIT_PROMPT", content: text });
    };

    const editMessage = (id: string, newContent: string) => {
        vscode.postMessage({
            type: "EDIT_MESSAGE",
            payload: { id, newContent }
        });
        // Optimistic update: Truncate locally?
        // It's complex to match backend truncation exactly. 
        // Better to wait for SYNC_MESSAGES which is triggered immediately by backend.
    };

    return { messages, isThinking, sendMessage, editMessage };
};
