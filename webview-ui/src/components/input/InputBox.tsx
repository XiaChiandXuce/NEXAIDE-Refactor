import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../common/Icons';

interface InputBoxProps {
    onSend: (text: string) => void;
    isThinking: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSend, isThinking }) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedModel, setSelectedModel] = useState("Qwen 3 Max");
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.model-selector-container')) {
                setShowModelDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const models = [
        "Qwen 3 Max",
        "Qwen 2.5 Plus",
        "Auto",
        "MAX Mode",
        "Gemini 3 Flash",
        "Gemini 3 Pro",
        "GPT-5.1 Codex Max",
        "Claude 3.5 Sonnet"
    ];

    return (
        <div className="input-area">
            <div className="input-container">
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to know?"
                    rows={1}
                />

                <div className="input-footer">
                    <div className="toolbar-left">
                        {/* Model Selector */}
                        <div className="model-selector-container">
                            <button
                                className="model-selector-btn"
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                title="Select Model"
                            >
                                <span className="model-selector-text">{selectedModel}</span>
                                <Icons.ChevronDown />
                            </button>

                            {showModelDropdown && (
                                <div className="model-dropdown-menu">
                                    {models.map(model => (
                                        <div
                                            key={model}
                                            className={`model-option ${selectedModel === model ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setShowModelDropdown(false);
                                            }}
                                        >
                                            {model}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="toolbar-right">
                        <button className="icon-btn" title="Add Image">
                            <Icons.Image />
                        </button>
                        <button className="icon-btn" title="Insert Code">
                            <Icons.Code />
                        </button>
                        <button className="icon-btn" title="Voice Input">
                            <Icons.Mic />
                        </button>

                        <button
                            className="icon-btn primary"
                            onClick={handleSend}
                            disabled={isThinking || !input.trim()}
                            title="Send Message"
                        >
                            <Icons.ArrowUp />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
