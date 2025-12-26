
import { useState, useEffect, useRef } from "react";
import { vscode } from "./utils/vscode";
import "./App.css";

// Simple Inline Icons to guarantee rendering without external fonts
const Icons = {
    Image: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor" />
        </svg>
    ),
    Code: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="currentColor" />
        </svg>
    ),
    Mic: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM19 11C19 14.53 16.39 17.44 13 17.93V21H11V17.93C7.61 17.44 5 14.53 5 11H7C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11H19Z" fill="currentColor" />
        </svg>
    ),
    ArrowUp: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12L5.41 13.41L11 7.83V20H13V7.83L18.58 13.41L20 12L12 4L4 12Z" fill="currentColor" />
        </svg>
    ),
    Loading: () => (
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="spin-anim">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" fill="none"></circle>
            <path d="M15 8c0-3.866-3.134-7-7-7" stroke="currentColor" strokeWidth="2" fill="none"></path>
        </svg>
    )
};

function App() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        vscode.onMessage((message) => {
            switch (message.type) {
                case "APPEND_TEXT":
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === "assistant") {
                            return [...prev.slice(0, -1), { ...last, content: last.content + message.text }];
                        } else {
                            return [...prev, { role: "assistant", content: message.text }];
                        }
                    });
                    break;
                case "STATE_CHANGED":
                    setIsThinking(message.newState === "THINKING" || message.newState === "WRITING");
                    break;
                case "DONE":
                    setIsThinking(false);
                    break;
            }
        });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: input }]);
        vscode.postMessage({ type: "SUBMIT_PROMPT", content: input });
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const [selectedModel, setSelectedModel] = useState("Gemini 3 Flash");
    const [showModelDropdown, setShowModelDropdown] = useState(false);

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

    const models = [
        "Auto",
        "MAX Mode",
        "Gemini 3 Flash",
        "Gemini 3 Pro",
        "GPT-5.1 Codex Max",
        "Claude 3.5 Sonnet"
    ];

    return (
        <div className="container">
            <div className="chat-list">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <span className="role-tag">
                            {msg.role === 'user' ? 'You' : 'NEXAIDE'}
                        </span>
                        <div className="content">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="thinking-indicator">
                        <Icons.Loading />
                        Thinking...
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

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
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
                                    </svg>
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
                            {/* Tools moved to right */}
                            <button className="icon-btn" title="Add Image">
                                <Icons.Image />
                            </button>
                            <button className="icon-btn" title="Insert Code">
                                <Icons.Code />
                            </button>
                            <button className="icon-btn" title="Voice Input">
                                <Icons.Mic />
                            </button>

                            {/* Send Button */}
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
        </div>
    );
}

export default App;
