import { useExtension } from "./hooks/useExtension";
import { BubbleListContainer } from "./components/chat/bubble-list";
import { InputBox } from "./components/input/InputBox";
import "./App.css";

function App() {
    const { messages, isThinking, sendMessage, editMessage } = useExtension();

    return (
        <div className="container">
            <BubbleListContainer
                messages={messages}
                isThinking={isThinking}
                onEditMessage={editMessage}
            />
            <InputBox onSend={sendMessage} isThinking={isThinking} />
        </div>
    );
}

export default App;
