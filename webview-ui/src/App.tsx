import { useState } from "react";
import { useExtension } from "./hooks/useExtension";
import { BubbleListContainer } from "./components/chat/bubble-list";
import { InputBox } from "./components/input/InputBox";
import { Header } from "./components/header/Header";
import { HistoryView } from "./components/history/HistoryView";
import type { ViewMode } from "./common/types";
import "./App.css";

function App() {
    const { messages, isThinking, sendMessage, editMessage, setMessages } = useExtension();
    const [viewMode, setViewMode] = useState<ViewMode>('chat');

    const handleHistory = () => {
        setViewMode(prev => prev === 'chat' ? 'history' : 'chat');
    };

    const handleSessionSelect = (id: string) => {
        console.log("Selected session:", id);
        // TODO: Load real session data here
        setViewMode('chat');
    };

    return (
        <div className="container" style={{ position: 'relative' }}>
            <Header
                onHistory={handleHistory}
                onNewChat={() => setViewMode('chat')}
            />

            {viewMode === 'chat' ? (
                <>
                    <BubbleListContainer
                        messages={messages}
                        isThinking={isThinking}
                        onEditMessage={editMessage}
                        setMessages={setMessages}
                    />
                    <InputBox onSend={sendMessage} isThinking={isThinking} />
                </>
            ) : (
                <HistoryView onSessionSelect={handleSessionSelect} />
            )}
        </div>
    );
}

export default App;
