import React, { useState } from 'react';
import { Actions } from '@ant-design/x';
import {
    CopyOutlined,
    RedoOutlined,
    LikeOutlined,
    DislikeOutlined,
    LikeFilled,
    DislikeFilled
} from '@ant-design/icons';
import type { ActionHandlers } from '../chat.config';

interface FeedbackActionsProps {
    content: string;
    itemKey: string;
    handlers: ActionHandlers;
}

/**
 * FeedbackActions Component
 * 
 * Responsibilities:
 * 1. Render action buttons (Copy, Retry, Like, Dislike).
 * 2. Manage local feedback state (visually toggling icons).
 * 3. Delegate actual logic to handlers.
 */
export const FeedbackActions: React.FC<FeedbackActionsProps> = ({
    content,
    itemKey,
    handlers
}) => {
    // Local state for immediate visual feedback
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

    const handleFeedback = (type: 'like' | 'dislike') => {
        // Toggle off if clicking the same one
        const newFeedback = feedback === type ? null : type;
        setFeedback(newFeedback);

        // Only trigger handler if it's a new positive action 
        // (or we could handle cancelation, but for now let's just log the action)
        if (newFeedback) {
            handlers.onFeedback(itemKey, newFeedback);
        }
    };

    return (
        <Actions
            style={{ opacity: 0.8 }} // Slightly higher opacity for visibility
            items={[
                {
                    key: 'copy',
                    icon: <CopyOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Copy'
                },
                {
                    key: 'retry',
                    icon: <RedoOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Retry'
                },
                {
                    key: 'like',
                    icon: feedback === 'like'
                        ? <LikeFilled style={{ color: 'var(--vscode-textLink-foreground) !important' }} />
                        : <LikeOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Good'
                },
                {
                    key: 'dislike',
                    icon: feedback === 'dislike'
                        ? <DislikeFilled style={{ color: 'var(--vscode-errorForeground) !important' }} />
                        : <DislikeOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Bad'
                }
            ]}
            onClick={(info) => {
                if (info.key === 'copy') handlers.onCopy(content);
                if (info.key === 'retry') handlers.onRetry(itemKey);
                if (info.key === 'like') handleFeedback('like');
                if (info.key === 'dislike') handleFeedback('dislike');
            }}
        />
    );
};
