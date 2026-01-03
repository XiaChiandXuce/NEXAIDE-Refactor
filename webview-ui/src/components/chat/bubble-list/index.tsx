import type { GetRef } from 'antd';
import React, { useRef } from 'react';
import { Bubble } from '@ant-design/x';
import type { Message } from '../../../hooks/useExtension';
import { useChatAdapter } from './useChatAdapter';
import { getBubbleRoles } from './chat.config';
import { BrandLogo } from '../../branding/BrandLogo';
import { ThinkingWidget } from '../ThinkingWidget';
import { useScrollController } from './hooks/useScrollController';
import { ScrollToBottomButton } from './components/ScrollToBottomButton';

interface BubbleListContainerProps {

    messages: Message[];
    isThinking: boolean;
    onEditMessage: (id: string, newContent: string) => void;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // 🧩 Phase 4: State Setter Injection
}

/**
 * Bubble.List Smart Container
 * 
 * Responsibilities:
 * 1. Wire up the Adapter (Data) with the Strategy (UI).
 * 2. Manage the Bubble.List instance ref.
 * 3. Handle AutoScroll (using AntD X's native autoScroll prop).
 */
export const BubbleListContainer: React.FC<BubbleListContainerProps> = ({
    messages,
    isThinking,
    onEditMessage,
    setMessages // Destructure from props
}) => {
    // 1. Adapter: Transform Data & Lift State
    const { bubbleItems, handlers } = useChatAdapter(messages, isThinking, onEditMessage, setMessages);

    // 2. Strategy: Get UI Configuration
    // We memoize this to prevent unnecessary re-renders of the Bubble.List
    const roles = React.useMemo(() => getBubbleRoles(handlers), [handlers]);

    // 3. Ref: For manual scroll control if needed
    const listRef = useRef<GetRef<typeof Bubble.List>>(null);

    // 4. Logic: Scroll Controller (Hook-based Architecture)
    const {
        showScrollDown,
        onScroll: handleScroll,
        scrollToBottom,
        isAutoScrollEnabled
    } = useScrollController(listRef, messages);

    // 5. Parity Logic: Empty State
    // If no interaction (messages are empty), show BrandLogo
    const hasInteraction = messages.some(m => m.role === 'user' || m.role === 'assistant');

    if (!hasInteraction) {
        return (
            <div className="chat-list" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <BrandLogo status={isThinking ? 'thinking' : 'idle'} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                <Bubble.List
                    ref={listRef}
                    items={bubbleItems}
                    role={roles}
                    // Enable autoScroll controlled by our hook
                    autoScroll={isAutoScrollEnabled}
                    onScroll={handleScroll}
                    style={{
                        height: '100%',
                    }}
                />
                <ScrollToBottomButton
                    visible={showScrollDown}
                    onClick={() => scrollToBottom(true)}
                />
            </div>
            <ThinkingWidget isThinking={isThinking} />
        </div>
    );
};
