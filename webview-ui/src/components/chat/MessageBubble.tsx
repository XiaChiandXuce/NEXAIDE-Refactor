import React from 'react';
import { Actions, Bubble, type BubbleProps } from '@ant-design/x';
import { AntDesignOutlined, RedoOutlined, CopyOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import type { Message } from '../../hooks/useExtension';

import { MarkdownRenderer } from '../markdown/MarkdownRenderer';

interface MessageBubbleProps {
    message: Message;
    loading?: boolean;
    typing?: BubbleProps['typing'];
    streaming?: boolean;
}

// Source-0.0.1: https://x.ant.design/components/bubble-cn?utm_source=chatgpt.com

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, loading, typing, streaming }) => {
    const isAssistant = message.role === 'assistant';

    const actionItems = (content: string) => [
        {
            key: 'copy',
            label: 'Copy',
            icon: <CopyOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />,
            onClick: () => {
                navigator.clipboard.writeText(content);
            },
        },
        {
            key: 'retry',
            icon: <RedoOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />,
            label: 'Retry',
            // Add retry logic callback here if needed
        },
    ];

    return (
        <Bubble
            content={message.content}
            loading={loading}
            typing={typing}
            // For older ADX versions it might be 'loading' behavior, but user snippet shows 'streaming'
            // We pass it if provided, or rely on internal logic if Ant Design X supports it directly.
            // Note: If type error occurs, we might need to cast or check version.
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
            // Use different styling or props based on role if needed
            // For assistant, show avatar and actions
            avatar={
                isAssistant ? (
                    <Avatar icon={<AntDesignOutlined />} style={{ backgroundColor: 'transparent', color: 'var(--vscode-foreground)' }} />
                ) : (
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--vscode-button-background)' }} />
                )
            }
            // Only show actions for assistant messages generally, placed on the side (extra)
            // Place actions in the footer, external bottom-right
            footer={
                !loading && isAssistant ? (
                    <Actions
                        items={actionItems(typeof message.content === 'string' ? message.content : '')}
                        style={{ opacity: 0.6 }} // Subtle by default
                    />
                ) : null
            }
            footerPlacement="outer-end"

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
