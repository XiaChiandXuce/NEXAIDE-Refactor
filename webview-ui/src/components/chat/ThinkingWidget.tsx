import React, { useState } from 'react';
import { Icons } from '../common/Icons';

interface ThinkingWidgetProps {
    thinkingContent?: string; // Optional: if we have actual thoughts to show
    isThinking: boolean;
}

export const ThinkingWidget: React.FC<ThinkingWidgetProps> = ({ thinkingContent, isThinking }) => {
    const [expanded, setExpanded] = useState(false);

    // If not thinking and no content, show nothing
    if (!isThinking && !thinkingContent) return null;

    return (
        <div className="thinking-widget">
            <div
                className="thinking-header"
                onClick={() => setExpanded(!expanded)}
                title="Click to view thought process"
            >
                {isThinking ? (
                    <div className="thinking-icon spin-anim">
                        <Icons.Loading />
                    </div>
                ) : (
                    <div className="thinking-icon success">
                        {/* Checkmark or Globe */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                )}

                <span className="thinking-label">
                    {isThinking ? "Thinking Process..." : "Finished Thinking"}
                </span>

                <div className={`thinking-chevron ${expanded ? 'expanded' : ''}`}>
                    <Icons.ChevronDown />
                </div>
            </div>

            {expanded && (
                <div className="thinking-content">
                    {thinkingContent ? (
                        <div className="thought-stream">
                            {thinkingContent}
                        </div>
                    ) : (
                        <div className="thought-placeholder">
                            Analyzing context...<br />
                            Planning response...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
