import React from 'react';
import { Plus, History, MoreHorizontal, X } from 'lucide-react';
import { IconButton } from '../common/IconButton';

export interface HeaderActionsProps {
    onNewChat?: () => void;
    onHistory?: () => void;
    onMore?: () => void;
    onClose?: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
    onNewChat,
    onHistory,
    onMore,
    onClose
}) => {
    return (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <IconButton
                icon={<Plus size={16} />}
                title="New Chat"
                onClick={onNewChat}
            />
            <IconButton
                icon={<History size={16} />}
                title="History"
                onClick={onHistory}
            />
            <IconButton
                icon={<MoreHorizontal size={16} />}
                title="More Actions"
                onClick={onMore}
            />
            <IconButton
                icon={<X size={16} />}
                title="Close"
                onClick={onClose}
            />
        </div>
    );
};
