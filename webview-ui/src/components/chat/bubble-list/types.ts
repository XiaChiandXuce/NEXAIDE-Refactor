import type { BubbleItemType } from '@ant-design/x';

/**
 * Extended Bubble Item Type
 * 
 * We extend the native Ant Design X BubbleItemType to include
 * potential custom fields required by NEXAIDE's business logic,
 * such as 'editable' state which needs to be lifted up to the adapter.
 */
export interface ExtendedBubbleItem extends BubbleItemType {
    // Add any NEXAIDE-specific fields here if needed.
    // For now, AntD X's type is quite flexible, but we might need
    // to enforce specific strict types for 'role'.
    role: 'ai' | 'user' | 'system';

    // We explicitly type 'editable' because it's crucial for our controlled flow
    editable?: boolean;
}
