import { ArrowDownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface ScrollToBottomButtonProps {
    visible: boolean;
    onClick: () => void;
}

/**
 * ScrollToBottomButton Component
 * 
 * A floating button that appears when the user has scrolled up to view history.
 * It strictly embraces the "Dumb Component" pattern - only responsible for rendering.
 */
export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
    visible,
    onClick
}) => {
    if (!visible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '80px', // Position above the input box/thinking widget
                right: '20px',
                zIndex: 10,
                transition: 'opacity 0.3s ease-in-out',
                opacity: visible ? 1 : 0,
            }}
        >
            <Button
                shape="circle"
                icon={<ArrowDownOutlined />}
                onClick={onClick}
                style={{
                    backgroundColor: 'var(--vscode-button-background)',
                    color: 'var(--vscode-button-foreground)',
                    border: '1px solid var(--vscode-widget-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            />
        </div>
    );
};
