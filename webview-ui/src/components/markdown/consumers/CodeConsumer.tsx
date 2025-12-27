import React from 'react';
import { Button, Flex, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface CodeProps {
    children?: React.ReactNode;
    className?: string;
    [key: string]: any;
}

// This component 'consumes' the code node from AST
export const CodeConsumer: React.FC<CodeProps> = ({ children, className, ...props }) => {
    // If inline code (single backtick), just render span
    // Note: XMarkdown typically distinguishes inline via props or utility
    // But for now let's assume if it has a language class, it is a block

    // Simple copy handler
    const handleCopy = () => {
        const text = String(children);
        navigator.clipboard.writeText(text);
        message.success('Code copied!');
    };

    // If it is a code block (usually has className like language-ts)
    if (className) {
        return (
            <div style={{ position: 'relative', margin: '8px 0' }}>
                <Flex justify="space-between" align="center" style={{
                    background: 'var(--vscode-editor-background)',
                    padding: '4px 8px',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    borderBottom: '1px solid var(--vscode-widget-border)'
                }}>
                    <span style={{ fontSize: '12px', color: 'var(--vscode-descriptionForeground)' }}>
                        {className.replace('language-', '')}
                    </span>
                    <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                        style={{ color: 'var(--vscode-button-foreground)' }}
                    />
                </Flex>
                <code className={className} {...props} style={{ display: 'block', padding: '16px', overflowX: 'auto', background: 'var(--vscode-editor-background)' }}>
                    {children}
                </code>
            </div>
        );
    }

    // Inline code
    return (
        <code className={className} {...props} style={{
            background: 'var(--vscode-textBlockQuote-background)',
            padding: '2px 4px',
            borderRadius: '4px',
            color: 'var(--vscode-textPreformat-foreground)'
        }}>
            {children}
        </code>
    );
};
