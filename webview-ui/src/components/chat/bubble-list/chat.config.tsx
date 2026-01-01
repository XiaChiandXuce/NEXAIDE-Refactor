import { AntDesignOutlined, UserOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
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
export interface ActionHandlers {
    onCopy: (content: string) => void;
    onRetry: (id: string) => void;
    onEdit: (id: string) => void;
    onEditConfirm: (id: string, content: string) => void;
    onEditCancel: (id: string) => void;
    onFeedback: (id: string, type: 'like' | 'dislike') => void;
}

import { CustomLoading } from './components/CustomLoading';
import { FeedbackActions } from './components/FeedbackActions';

// 特性开关 (Feature Flag): 自定义加载动画
// Feature Flag: Custom Loading Animation
// 
// 控制组件 (Controlled Component): CustomLoading (Thinking... + Logo 动画 / Animation)
// 逻辑说明 (Logic):
// - true:  开启高级品牌动画 (Enable advanced branded animation) -> 使用 CustomLoading 组件 (Use CustomLoading)
// - false: 关闭高级动画 (Disable advanced animation) -> 回退到 Ant Design 默认的 Loading 样式 (Fallback to default Ant Design loading dots)
const ENABLE_BRAND_LOADING = false;

export const getBubbleRoles = (handlers: ActionHandlers): BubbleListProps['role'] => ({
    ai: {
        placement: 'start',
        typing: { step: 2, interval: 30, effect: 'typing' },
        // 动态加载控制 (Dynamic Loading Control):
        // 如果开关开启，渲染 CustomLoading 组件；否则返回 undefined (显示默认样式)
        // If enabled, render CustomLoading; otherwise return undefined (show default style)
        loadingRender: ENABLE_BRAND_LOADING ? () => <CustomLoading /> : undefined,
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
        footer: (content, item) => (
            // ✨ Semantic Customization: Feedback Actions
            <FeedbackActions
                content={typeof content === 'string' ? content : ''}
                itemKey={item.key?.toString() || ''}
                handlers={handlers}
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
