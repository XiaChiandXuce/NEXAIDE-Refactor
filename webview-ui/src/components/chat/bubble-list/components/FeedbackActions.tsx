import React from 'react';
import { Actions } from '@ant-design/x';
import {
    CopyOutlined,
    RedoOutlined
} from '@ant-design/icons';
import type { ActionHandlers } from '../chat.config';

interface FeedbackActionsProps {
    content: string;
    itemKey: string;
    // 🧩 Phase 4: Receive lifted state from parent
    extraInfo?: {
        feedback?: 'like' | 'dislike';
    };
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
    extraInfo,
    handlers
}) => {
    return (
        <Actions
            onClick={(info) => {
                if (info.key === 'copy') handlers.onCopy(content);
                if (info.key === 'retry') handlers.onRetry(itemKey);
            }}
            items={[
                {
                    key: 'copy',
                    icon: <CopyOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Copy',
                },
                {
                    key: 'retry',
                    icon: <RedoOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />,
                    label: 'Retry',
                },
                {
                    key: 'feedback',
                    // 🚀 Phase 4: Use Official Actions.Feedback Component
                    // This component handles the UI state (outline vs filled) automatically based on 'value'
                    actionRender: () => (
                        <Actions.Feedback
                            value={extraInfo?.feedback}
                            onChange={(val) => {
                                // Delegate update to adapter
                                // Map null/undefined back to 'like'/'dislike' string if needed
                                // But usually onChange returns 'like' | 'dislike' | null
                                if (val) {
                                    handlers.onFeedback(itemKey, val as 'like' | 'dislike');
                                }
                            }}
                            // Force styles to match VS Code theme
                            style={{
                                color: 'var(--vscode-icon-foreground)',
                                fontSize: '16px' // Ensure size consistency
                            }}
                            styles={{
                                liked: { color: 'var(--vscode-textLink-foreground) !important' },
                                disliked: { color: 'var(--vscode-errorForeground) !important' }
                            }}
                        />
                    )
                }
            ]}
        />
    );
};
