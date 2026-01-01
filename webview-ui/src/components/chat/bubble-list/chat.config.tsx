import { AntDesignOutlined, UserOutlined, CopyOutlined, RedoOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import type { BubbleListProps } from '@ant-design/x';
import { Actions } from '@ant-design/x';
import { Avatar } from 'antd';
import { MarkdownRenderer } from '../../markdown/MarkdownRenderer';
import type { ExtendedBubbleItem } from './types';


/**
 * Iron Rule #2: Token Mapping
 * We must force standard VS Code themes to prevent "Black on Black" in Dark Mode.
 */
const COMMON_STYLES = {
    user: {
        content: {
            backgroundColor: 'var(--chat-user-bg) !important',
            border: '1px solid var(--chat-user-border) !important',
            color: 'var(--chat-user-text) !important',
        }
    },
    ai: {
        content: {
            // Transparent background for AI to blend with editor background
            backgroundColor: 'transparent',
            color: 'var(--vscode-editor-foreground)',
            padding: 0, // AI usually has less padding if it's just text
        }
    }
};

/**
 * Action Strategy
 * Decoupled logic for actions. The actual handlers are passed from the Adapter.
 */
interface ActionHandlers {
    onCopy: (content: string) => void;
    onRetry: (id: string) => void;
    onEdit: (id: string) => void;
    onEditConfirm: (id: string, content: string) => void;
    onEditCancel: (id: string) => void;
}

export const getBubbleRoles = (handlers: ActionHandlers): BubbleListProps['role'] => ({
    ai: {
        placement: 'start',
        typing: { step: 2, interval: 30, effect: 'typing' },
        avatar: () => (
            <Avatar
                icon={<AntDesignOutlined />}
                style={{
                    backgroundColor: 'transparent',
                    color: 'var(--vscode-foreground)'
                }}
            />
        ),
        header: <span style={{ color: 'var(--vscode-foreground)' }}>Chat</span>,
        styles: COMMON_STYLES.ai,
        // Reuse MarkdownRenderer for consistent rendering
        contentRender: (content) => (
            <MarkdownRenderer content={typeof content === 'string' ? content : ''} />
        ),
        footer: (_content, item) => (
            <Actions
                style={{ opacity: 0.6 }}
                items={[
                    { key: 'copy', icon: <CopyOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />, label: 'Copy' },
                    { key: 'retry', icon: <RedoOutlined style={{ color: 'var(--vscode-icon-foreground) !important' }} />, label: 'Retry' }
                ]}
                onClick={(info) => {
                    // Check item for safety, though it should be passed
                    const extendedItem = item as ExtendedBubbleItem;
                    if (info.key === 'copy') handlers.onCopy(extendedItem.content as string);
                    if (info.key === 'retry') handlers.onRetry(extendedItem.key as string);
                }}
            />
        )
    },
    user: (item) => {
        const extendedItem = item as ExtendedBubbleItem;
        return {
            placement: 'end',
            typing: false,
            avatar: () => (
                <Avatar
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: 'var(--vscode-button-background)',
                        color: 'var(--vscode-button-foreground)'
                    }}
                />
            ),
            header: <span style={{ color: 'var(--vscode-foreground)' }}>User</span>,
            styles: COMMON_STYLES.user,
            contentRender: (content) => (
                <MarkdownRenderer content={typeof content === 'string' ? content : ''} />
            ),
            footer: () => (
                <Actions
                    style={{ opacity: 0.6 }}
                    items={[
                        extendedItem.editable
                            ? { key: 'done', icon: <CheckOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />, label: 'Done' }
                            : { key: 'edit', icon: <EditOutlined style={{ color: 'var(--vscode-icon-foreground)' }} />, label: 'Edit' }
                    ]}
                    onClick={(info) => {
                        if (info.key === 'edit') handlers.onEdit(extendedItem.key as string);
                        if (info.key === 'done') {
                            // For 'done', the content is passed by the Bubble's internal onEditConfirm
                            // But we trigger the mode switch here if needed, or wait for confirm
                        }
                    }}
                />
            ),
            // Binding Edit Events
            onEditConfirm: (content) => handlers.onEditConfirm(extendedItem.key as string, content),
            onEditCancel: () => handlers.onEditCancel(extendedItem.key as string),
        }
    },
    system: {
        variant: 'shadow',
        style: {
            alignSelf: 'center',
        },
        styles: {
            content: {
                backgroundColor: 'var(--vscode-badge-background)',
                color: 'var(--vscode-badge-foreground)',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '12px'
            }
        },
        avatar: () => null, // No avatar for system
    }
});
