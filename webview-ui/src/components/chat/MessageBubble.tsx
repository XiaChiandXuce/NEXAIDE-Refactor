import React from 'react';
import { Actions, Bubble } from '@ant-design/x';
import { AntDesignOutlined, RedoOutlined, CopyOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import type { Message } from '../../hooks/useExtension';

import { MarkdownRenderer } from '../markdown/MarkdownRenderer';

interface MessageBubbleProps {
    message: Message; // Using the type from useExtension
    loading?: boolean;
    typing?: {
        step: number;
        interval: number;
        effect: 'typing' | 'fade-in';
    };
    streaming?: boolean;
    onEditConfirm?: (id: string, newContent: string) => void;
}

// Source-0.0.1: https://x.ant.design/components/bubble-cn?utm_source=chatgpt.com

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, loading, typing, streaming, onEditConfirm }) => {
    const isAssistant = message.role === 'assistant';

    // State for Phase 1: Editable Bubble
    // In Phase 2, this state might be managed by a global store or context
    const [isEditing, setIsEditing] = React.useState(false);
    const [localContent, setLocalContent] = React.useState(typeof message.content === 'string' ? message.content : '');

    // Sync localContent if prop changes (and not editing)
    // Sync localContent if prop changes (and not editing)
    // We utilize a ref to track the previous prop value to avoid overwriting local edits
    // when simple re-renders occur or when isEditing toggles.
    const prevMessageContent = React.useRef(message.content);

    React.useEffect(() => {
        if (message.content !== prevMessageContent.current) {
            if (!isEditing && typeof message.content === 'string') {
                setLocalContent(message.content);
            }
            prevMessageContent.current = message.content;
        }
    }, [message.content, isEditing]);

    // Unified handleAction for both User and Assistant
    const handleActionClick = (key: string, content: string) => {
        switch (key) {
            case 'copy':
                navigator.clipboard.writeText(content);
                break;
            case 'retry':
                // Add retry logic here
                break;
            case 'edit':
                setIsEditing(true);
                break;
        }
    };

    const actionItems = [
        {
            key: 'copy',
            label: 'Copy',
            icon: <CopyOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />,
        },
        {
            key: 'retry',
            icon: <RedoOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />,
            label: 'Retry',
        },
    ];

    const userActions = [
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />,
        }
    ];

    const handleEditConfirm = (newContent: string) => {
        setIsEditing(false);
        setLocalContent(newContent);

        if (onEditConfirm && message.id) {
            onEditConfirm(message.id, newContent);
        } else {
            console.warn("Cannot edit message: Missing ID or onEditConfirm handler", message);
        }
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        // Revert to original if needed, but localContent is already state, so maybe just stop editing
        setLocalContent(typeof message.content === 'string' ? message.content : '');
    };

    return (
        <Bubble
            // Use localContent for display to support optimistic updates
            content={localContent}
            loading={loading}
            typing={typing}
            {...(streaming !== undefined ? { streaming } : {})}
            placement={isAssistant ? 'start' : 'end'}
            // Use specialized Markdown Renderer for rich text content
            contentRender={(content) => (
                <MarkdownRenderer content={typeof content === 'string' ? content : ''} />
            )}
            header={
                <span style={{
                    color: 'var(--vscode-foreground)',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    display: 'block'
                }}>
                    {isAssistant ? 'Chat' : 'User'}
                </span>
            }
            avatar={
                isAssistant ? (
                    <Avatar icon={<AntDesignOutlined />} style={{ backgroundColor: 'transparent', color: 'var(--vscode-foreground)' }} />
                ) : (
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--vscode-button-background)' }} />
                )
            }
            // Actions: Assistant gets Copy/Retry, User gets Edit
            footer={
                !loading ? (
                    <Actions
                        items={isAssistant ? actionItems : userActions}
                        onClick={(info) => handleActionClick(info.key as string, localContent)}
                        style={{ opacity: 0.6 }} // Subtle by default
                    />
                ) : null
            }
            footerPlacement="outer-end"

            // Editable Props
            editable={isEditing}
            onEditConfirm={handleEditConfirm}
            onEditCancel={handleEditCancel}

            // Style overrides to match VS Code theme
            style={{
                maxWidth: '100%',
                alignSelf: isAssistant ? 'flex-start' : 'flex-end',
            }}
            styles={{
                content: {
                    backgroundColor: isAssistant ? 'transparent' : 'var(--chat-user-bg)',
                    border: isAssistant ? 'none' : '1px solid var(--chat-user-border)',
                    color: isAssistant ? 'var(--vscode-editor-foreground)' : 'var(--chat-user-text)',
                    fontSize: '14px',
                },
                footer: {
                    // If we needed footer styles
                }
            }}
        />
    );
};
