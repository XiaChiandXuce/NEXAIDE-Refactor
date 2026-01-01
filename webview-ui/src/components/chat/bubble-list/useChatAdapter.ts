import type { ExtendedBubbleItem } from './types';
import type { Message } from '../../../hooks/useExtension';
import { useEffect, useState } from 'react';


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
    onEditMessage: (id: string, newContent: string) => void
) {
    const [bubbleItems, setBubbleItems] = useState<ExtendedBubbleItem[]>([]);

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
        onEditCancel: (id: string) => {
            setEditingId(null);
        }
    };

    // Transform Logic
    useEffect(() => {
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

        setBubbleItems(newItems);

    }, [messages, isThinking, editingId]);

    return { bubbleItems, handlers };
}
