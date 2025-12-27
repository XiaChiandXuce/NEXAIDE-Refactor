import { useExtension } from "./hooks/useExtension";
import { ChatList } from "./components/chat/ChatList";
import { InputBox } from "./components/input/InputBox";
import "./App.css";

function App() {
    const { messages, isThinking, sendMessage } = useExtension();

    return (
        <div className="container">
            <ChatList messages={messages} isThinking={isThinking} />
            <InputBox onSend={sendMessage} isThinking={isThinking} />
        </div>
    );
}

export default App;
