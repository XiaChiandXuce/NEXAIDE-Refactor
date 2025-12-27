import React, { useEffect, useRef } from 'react';
import type { Message } from '../../hooks/useExtension';
import { MessageBubble } from './MessageBubble';
import { SystemBubble } from './SystemBubble';
import { ThinkingWidget } from './ThinkingWidget';

interface ChatListProps {
    messages: Message[];
    isThinking: boolean;
}

import { BrandLogo } from '../branding/BrandLogo';

export const ChatList: React.FC<ChatListProps> = ({ messages, isThinking }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    // Check if chat is effectively empty (only has initial system message)
    // Assuming the first message is always technical system context which we might hide or just ignore for "Welcome" state.
    // However, the current code renders SystemBubble for system messages.
    // If we want to show Logo, we usually do it when there are no USER/ASSISTANT messages.
    const hasInteraction = messages.some(m => m.role === 'user' || m.role === 'assistant');

    if (!hasInteraction) {
        return (
            <div className="chat-list" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <BrandLogo status={isThinking ? 'thinking' : 'idle'} />
                <div ref={bottomRef} />
            </div>
        );
    }

    return (
        <div className="chat-list">
            {messages.map((msg, i) => {
                const isSystem = msg.role === 'system';
                const isAssistant = msg.role === 'assistant';
                const isLast = i === messages.length - 1;

                // Keep typing animation for visual smoothness, but only 'stream' (cursor) if it's the active last message and we are thinking.
                // Actually, if we are thinking, the *next* token triggers 'streaming'. 
                // But generally, if it's the last message and isAssistant, we assume it might be streaming if isThinking is true.
                // However, isThinking might be true even before the first token (handled by ghost bubble).
                // Once the first token arrives, the ghost bubble is gone, and this bubble appears.
                // So if isThinking is true, and this IS the last message (and it's assistant), it IS streaming.

                return isSystem ? (
                    <SystemBubble key={i} message={msg} />
                ) : (
                    <MessageBubble
                        key={i}
                        message={msg}
                        typing={{ step: 2, interval: 30, effect: 'typing' }}
                        streaming={isAssistant && isLast && isThinking}
                    />
                );
            })}

            {/* Show loading bubble only when thinking but no assistant message is streaming yet */}
            {isThinking && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                <MessageBubble
                    message={{ role: 'assistant', content: '' }}
                    loading={true}
                />
            )}
            <ThinkingWidget isThinking={isThinking} />
            <div ref={bottomRef} />
        </div>
    );
};
