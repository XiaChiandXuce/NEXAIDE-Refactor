import type { ExtendedBubbleItem } from './types';
import type { Message } from '../../../hooks/useExtension';
import { useMemo, useState } from 'react';


/**
 * Chat Adapter Hook
 * 
 * Responsibilities:
 * 1. Adapter Pattern: Transform NEXAIDE 'Message' -> AntD X 'BubbleItemType'
 * 2. State Management: Lift 'editable' state up from individual bubbles
 * 3. Loading Logic: Inject loading states provided by the backend
 */
export function useChatAdapter(
    messages: Message[],
    isThinking: boolean,
    onEditMessage: (id: string, newContent: string) => void,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>> // Added setMessages
) {
    // Store the ID of the message currently being edited
    const [editingId, setEditingId] = useState<string | null>(null);

    // Handlers exposed to strategy (chat.config.tsx)
    const handlers = {
        onCopy: (content: string) => {
            navigator.clipboard.writeText(content);
        },
        onRetry: (_id: string) => {
            console.log('Retry not implemented yet');
            // Will hook into useExtension's retry later
        },
        onEdit: (id: string) => {
            setEditingId(id);
        },
        onEditConfirm: (id: string, content: string) => {
            // 1. Optimistic update (optional, but wait for backend sync usually)
            // 2. Clear edit mode
            setEditingId(null);
            // 3. Trigger actual update
            onEditMessage(id, content);
        },
        onEditCancel: (_id: string) => {
            setEditingId(null);
        },
        onFeedback: (id: string, type: 'like' | 'dislike') => {
            // 🚀 Phase 4: Update local state via immutable pattern
            // This is the "Lifting State Up" in action
            setMessages(prev => prev.map(msg => {
                if (msg.id === id) {
                    return {
                        ...msg,
                        // Ensure data object exists
                        data: {
                            ...(msg.data || {}),
                            feedback: type
                        }
                    };
                }
                return msg;
            }));

            // TODO: Sync with backend extension
            console.log(`[Feedback] Message ${id} updated to ${type}`);
        }
    };

    // Transform Logic
    const bubbleItems: ExtendedBubbleItem[] = useMemo(() => {
        const newItems: ExtendedBubbleItem[] = messages.flatMap((msg, index) => {
            const isLast = index === messages.length - 1;

            // 1. Map Role
            let role: ExtendedBubbleItem['role'] = 'user';
            if (msg.role === 'assistant') role = 'ai';
            if (msg.role === 'system') role = 'system';

            // 2. Base Item
            const item: ExtendedBubbleItem = {
                key: msg.id || `msg-${index}`,
                role: role,
                content: msg.content,
                editable: editingId === msg.id,
                // 🧩 Phase 4: Map extraInfo from message metadata
                extraInfo: msg.data as any,
            };

            // 3. Handle Streaming / Typing Effect
            if (role === 'ai' && isLast && isThinking) {
                // If it's the last AI message and we are thinking, it might be streaming.
                // Note: AntD X 'typing' handles the visual effect.
                // We might want to enable typing only for the very last message.
                item.loading = false; // It has content, so not full loading
                // item.typing = { step: 2, interval: 30 }; // Configured in strategy, but could override here
            }

            return [item];
        });

        // 4. Ghost Bubble (If thinking but no partial response yet)
        if (isThinking) {
            const lastMsg = messages[messages.length - 1];
            // If the last message is NOT from assistant, or if it is but we want to show a separate indicator
            // Usually if last is user, we show ghost.
            if (!lastMsg || lastMsg.role !== 'assistant') {
                newItems.push({
                    key: 'ghost-loading',
                    role: 'ai',
                    content: '',
                    loading: true,
                });
            }
        }

        return newItems; // Correctly return the value instead of setting state

    }, [messages, isThinking, editingId]);

    return { bubbleItems, handlers };
}
