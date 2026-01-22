import React from 'react';

interface IconButtonProps {
    icon: React.ReactNode;
    onClick?: () => void;
    title?: string;
    className?: string;
    active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    title,
    className = '',
    active = false
}) => {
    return (
        <button
            className={`icon-btn ${active ? 'active' : ''} ${className}`}
            onClick={onClick}
            title={title}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px', // Slightly larger touch target than icon
                height: '28px',
                padding: '4px',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'var(--vscode-icon-foreground)',
                opacity: 0.8,
                transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31))';
                e.currentTarget.style.opacity = '1';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.opacity = '0.8';
            }}
        >
            {icon}
        </button>
    );
};
