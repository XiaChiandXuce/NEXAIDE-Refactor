import React, { useState } from 'react';
import { Bubble } from '@ant-design/x';
import { Flex } from 'antd';
import logo from '../../assets/nexaide-logo.svg';

export interface BrandLogoProps {
    status?: 'idle' | 'thinking' | 'error';
    onClick?: () => void;
    size?: 'small' | 'medium' | 'large' | number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ status = 'idle', onClick, size = 'medium' }) => {
    const [subTitle, setSubTitle] = useState('AI Coding Assistant');

    const handleLogoClick = () => {
        setSubTitle(prev => prev === 'AI Coding Assistant' ? '🎉 Happy Coding with NEXAIDE!' : 'AI Coding Assistant');
        onClick?.();
    };

    const logoSize = typeof size === 'number' ? size : (size === 'small' ? 32 : size === 'medium' ? 48 : 64);

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Bubble
                placement="end"
                content="" // Empty content as we use contentRender
                styles={{
                    content: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        border: 'none',
                    }
                }}
                contentRender={() => (
                    <Flex vertical align="center" gap="small" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                        <img
                            src={logo}
                            alt="NEXAIDE"
                            style={{
                                height: logoSize,
                                width: logoSize,
                                transition: 'all 0.3s ease',
                                opacity: status === 'thinking' ? 0.7 : 1,
                                transform: status === 'thinking' ? 'scale(1.1)' : 'scale(1)',
                                filter: status === 'error' ? 'grayscale(100%)' : 'none',
                                animation: status === 'thinking' ? 'pulse 2s infinite' : 'none'
                            }}
                        />
                        <Flex vertical align="center">
                            <span style={{
                                fontSize: size === 'small' ? 16 : 20,
                                fontWeight: 'bold',
                                color: 'var(--vscode-editor-foreground)'
                            }}>
                                NEXAIDE
                            </span>
                            <span style={{
                                fontSize: 12,
                                color: 'var(--vscode-descriptionForeground)',
                                opacity: 0.8
                            }}>
                                {subTitle}
                            </span>
                        </Flex>

                        {/* Define simple keyframes style within component for self-containment */}
                        <style>
                            {`
                                @keyframes pulse {
                                    0% { transform: scale(1); opacity: 1; }
                                    50% { transform: scale(1.05); opacity: 0.8; }
                                    100% { transform: scale(1); opacity: 1; }
                                }
                            `}
                        </style>
                    </Flex>
                )}
            />
        </div>
    );
};
