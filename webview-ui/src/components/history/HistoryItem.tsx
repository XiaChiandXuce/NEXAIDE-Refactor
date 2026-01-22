import React from 'react';
import type { ChatSession } from '../../common/types';

interface HistoryItemProps {
    session: ChatSession;
    onClick: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ session, onClick }) => {
    return (
        <div
            onClick={() => onClick(session.id)}
            style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--vscode-list-hoverBackground)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--vscode-list-hoverBackground)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <div style={{
                color: 'var(--vscode-foreground)',
                fontWeight: 500,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {session.title}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--vscode-descriptionForeground)',
                fontSize: '11px'
            }}>
                <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '70%'
                }}>{session.preview}</span>
                <span>{new Date(session.timestamp).toLocaleDateString()}</span>
            </div>
        </div>
    );
};
