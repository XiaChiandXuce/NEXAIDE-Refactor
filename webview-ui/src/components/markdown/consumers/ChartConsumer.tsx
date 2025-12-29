import React from 'react';
import { Line } from '@antv/gpt-vis';
import { Skeleton } from 'antd';

interface ChartProps {
    children?: React.ReactNode;
    axisXTitle?: string;
    axisYTitle?: string;
    streamStatus?: 'loading' | 'done' | 'error';
    [key: string]: any;
}

export const ChartConsumer: React.FC<ChartProps> = (props) => {
    const { children, axisXTitle, axisYTitle, streamStatus } = props;

    // If streaming is still in progress and we don't have valid children yet, showing skeleton
    if (streamStatus === 'loading') {
        return <Skeleton.Image active={true} style={{ width: '100%', height: 200 }} />;
    }

    try {
        // The children here is expected to be a JSON string of data
        // e.g. [{"time":2013,"value":59.3}, ...]
        const dataStr = String(children).trim();
        if (!dataStr) return null;

        const data = JSON.parse(dataStr);

        return (
            <div style={{ margin: '16px 0', padding: '16px', background: 'var(--vscode-editor-background)', borderRadius: '8px' }}>
                <Line
                    data={data}
                    axisXTitle={axisXTitle}
                    axisYTitle={axisYTitle}
                // AntV GPT-Vis Line component might need explicit width or responsive container
                // But usually it handles responsiveness.
                />
            </div>
        );
    } catch (e) {
        // Fallback for invalid JSON or parsing error
        console.error('Failed to render chart data', e);
        return <div style={{ color: 'var(--vscode-errorForeground)' }}>[Chart Error: Invalid Data]</div>;
    }
};
