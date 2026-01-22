import React from 'react';
import { History } from 'lucide-react';

// Adapter Pattern Interface
interface HistoryIconProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    size?: number;
}

/**
 * HistoryIcon Wrapper Component
 * 
 * Responsibilities:
 * 1. Adapter: Decouple from underlying library (lucide-react)
 * 2. Theme: Enforce VS Code native look & feel (var(--vscode-icon-foreground))
 */
export const HistoryIcon: React.FC<HistoryIconProps> = ({
    className,
    style,
    onClick,
    size = 16 // Default to standard VS Code icon size
}) => {
    return (
        <History
            className={className}
            size={size}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                // 🎨 Enforce Native Theme Integration
                color: 'var(--vscode-icon-foreground)',
                ...style
            }}
        // Add hover effect via CSS class or inline style if needed, 
        // usually handled by parent button wrapper or global CSS.
        />
    );
};
