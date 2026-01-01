import React from 'react';
import { Flex } from 'antd';
import { BrandLogo } from '../../../branding/BrandLogo';

/**
 * CustomLoading Component
 * 
 * Responsibilities:
 * 1. Display the NEXAIDE brand logo in a 'thinking' state.
 * 2. Provide a visual indicator for AI processing.
 * 
 * Note: This is an atomic presentation component.
 */
export const CustomLoading: React.FC = () => {
    return (
        <Flex gap="small" align="center" style={{ padding: '4px 0' }}>
            <BrandLogo status="thinking" size={16} />
            <span style={{
                color: 'var(--vscode-descriptionForeground)',
                fontSize: '12px',
                opacity: 0.8
            }}>
                Thinking...
            </span>
        </Flex>
    );
};
