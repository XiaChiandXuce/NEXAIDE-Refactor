import type { GetRef } from 'antd';
import React, { useRef } from 'react';
import { Bubble } from '@ant-design/x';
import type { Message } from '../../../hooks/useExtension';
import { useChatAdapter } from './useChatAdapter';
import { getBubbleRoles } from './chat.config';
import { BrandLogo } from '../../branding/BrandLogo';

interface BubbleListContainerProps {

    messages: Message[];
    isThinking: boolean;
    onEditMessage: (id: string, newContent: string) => void;
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
    onEditMessage
}) => {
    // 1. Adapter: Transform Data & Lift State
    const { bubbleItems, handlers } = useChatAdapter(messages, isThinking, onEditMessage);

    // 2. Strategy: Get UI Configuration
    // We memoize this to prevent unnecessary re-renders of the Bubble.List
    const roles = React.useMemo(() => getBubbleRoles(handlers), [handlers]);

    // 3. Ref: For manual scroll control if needed
    const listRef = useRef<GetRef<typeof Bubble.List>>(null);

    // 4. Parity Logic: Empty State
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
        <Bubble.List
            ref={listRef}
            items={bubbleItems}
            role={roles}
            // Enable autoScroll by default, mimicking existing ChatList behavior
            autoScroll={true}
            style={{
                height: '100%',
                // Ensure the container handles overflow correctly
                overflow: 'hidden'
            }}
        />
    );
};
