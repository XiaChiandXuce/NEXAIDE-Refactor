import React, { useState, useEffect } from 'react';
import type { ChatSession } from '../../common/types';
import { HistoryList } from './HistoryList';

interface HistoryViewProps {
    onSessionSelect: (id: string) => void;
}

const MOCK_SESSIONS: ChatSession[] = [
    {
        id: '1',
        title: 'Refactor Chat UI Header',
        timestamp: Date.now(),
        preview: 'To align with Antigravity design...'
    },
    {
        id: '2',
        title: 'Implement History Feature',
        timestamp: Date.now() - 3600000,
        preview: 'I need to implement a history view...'
    },
    {
        id: '3',
        title: 'Debug Extensions',
        timestamp: Date.now() - 86400000,
        preview: 'Why is the extension not loading?'
    }
];

export const HistoryView: React.FC<HistoryViewProps> = ({ onSessionSelect }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate async fetching
        const timer = setTimeout(() => {
            setSessions(MOCK_SESSIONS);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--vscode-descriptionForeground)'
            }}>
                Loading history...
            </div>
        );
    }

    return (
        <HistoryList
            sessions={sessions}
            onItemClick={onSessionSelect}
        />
    );
};
