
// Protocol definitions for NEXAIDE
export type AgentState = 'IDLE' | 'THINKING' | 'WRITING' | 'ERROR';

// --- UI Protocol (View -> Core) ---
export type UserAction =
    | { type: 'SUBMIT_PROMPT', content: string }
    | { type: 'STOP_GENERATION' }
    | { type: 'CLEAR_HISTORY' }
    | { type: 'SET_CONFIG', key: string, value: any }
    | { type: 'EDIT_MESSAGE', payload: { id: string, newContent: string } };

// --- Core Protocol (Core -> View) ---
export type AgentEvent =
    | { type: 'STATE_CHANGED', newState: AgentState }
    | { type: 'APPEND_TEXT', text: string }
    | { type: 'REPLACE_TEXT', text: string } // For full refresh
    | { type: 'SYNC_MESSAGES', messages: { role: 'user' | 'assistant' | 'system', content: string, id: string }[] }
    | { type: 'ERROR', message: string }
    | { type: 'DONE' };

export type ToWebviewMessage = AgentEvent;

// --- API Interfaces ---
export interface LLMRequest {
    messages: { role: 'user' | 'assistant' | 'system', content: string }[];
    temperature?: number;
    model?: string;
    // ... avante compatible options
}

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onError: (err: Error) => void;
    onDone: () => void;
}

export interface ChatSession {
    id: string;
    title: string;
    timestamp: number;
    model?: string;
    preview: string;
}

export type ViewMode = 'chat' | 'history';
