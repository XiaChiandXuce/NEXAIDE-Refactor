import React from 'react';
import XMarkdown from '@ant-design/x-markdown';
import { CodeConsumer } from './consumers/CodeConsumer';
import { LinkConsumer } from './consumers/LinkConsumer';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <XMarkdown
            content={content}
            components={{
                code: CodeConsumer,
                a: LinkConsumer
            }}
            // Style overrides to ensure it fits into VS Code theme
            style={{
                color: 'var(--vscode-editor-foreground)',
                fontSize: '14px',
                lineHeight: '1.5'
            }}
        />
    );
};
