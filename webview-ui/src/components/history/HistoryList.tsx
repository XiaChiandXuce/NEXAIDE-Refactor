import React from 'react';
import type { ChatSession } from '../../common/types';
import { HistoryItem } from './HistoryItem';

interface HistoryListProps {
    sessions: ChatSession[];
    onItemClick: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ sessions, onItemClick }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100%',
        }}>
            {sessions.map(session => (
                <HistoryItem
                    key={session.id}
                    session={{
                        ...session,
                        preview: session.preview || "No preview available"
                    }}
                    onClick={onItemClick}
                />
            ))}
            {sessions.length === 0 && (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--vscode-descriptionForeground)',
                    fontSize: '13px'
                }}>
                    No history found
                </div>
            )}
        </div>
    );
};
