import React from 'react';
import { HeaderActions, type HeaderActionsProps } from './HeaderActions';

export const Header: React.FC<HeaderActionsProps> = (props) => {
    return (
        <div
            className="header-container"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px',
                height: '40px',
                // borderBottom: '1px solid var(--vscode-widget-border)', // Removed for cleaner Antigravity look
                backgroundColor: 'var(--vscode-sideBar-background)',
                userSelect: 'none',
                // Ensure it stays at top
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}
        >
            <div
                className="header-title"
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--vscode-sideBarTitle-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                Agent
            </div>

            <HeaderActions {...props} />
        </div>
    );
};
