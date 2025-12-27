import React from 'react';

interface LinkProps {
    children?: React.ReactNode;
    href?: string;
    [key: string]: any;
}

export const LinkConsumer: React.FC<LinkProps> = ({ children, href, ...props }) => {
    return (
        <a
            href={href}
            {...props}
            style={{ color: 'var(--vscode-textLink-foreground)', textDecoration: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
};
