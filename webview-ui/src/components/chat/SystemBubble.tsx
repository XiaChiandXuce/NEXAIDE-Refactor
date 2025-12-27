import React from 'react';
import { Bubble } from '@ant-design/x';
import type { Message } from '../../hooks/useExtension';

interface SystemBubbleProps {
    message: Message;
}

export const SystemBubble: React.FC<SystemBubbleProps> = ({ message }) => {
    return (
        <Bubble.System
            content={
                <div style={{ color: 'var(--vscode-descriptionForeground)' }}>
                    {message.content}
                </div>
            }
            variant="borderless"
            style={{ margin: '8px 0' }}
        />
    );
};
