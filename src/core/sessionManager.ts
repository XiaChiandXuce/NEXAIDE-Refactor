
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface Session {
    id: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

export class SessionManager {
    private currentSession: Session;
    private history: Session[] = [];

    constructor() {
        this.currentSession = this.createNewSession();
    }

    private createNewSession(): Session {
        const now = Date.now();
        return {
            id: uuidv4(),
            messages: [],
            createdAt: now,
            updatedAt: now
        };
    }

    public startNewSession() {
        if (this.currentSession.messages.length > 0) {
            this.history.push(this.currentSession);
        }
        this.currentSession = this.createNewSession();
    }

    public addMessage(role: 'user' | 'assistant' | 'system', content: string): ChatMessage {
        const msg: ChatMessage = {
            id: uuidv4(),
            role,
            content,
            timestamp: Date.now()
        };
        this.currentSession.messages.push(msg);
        this.currentSession.updatedAt = Date.now();
        return msg;
    }

    public truncateFrom(messageId: string): void {
        const index = this.currentSession.messages.findIndex(m => m.id === messageId);
        if (index === -1) {
            throw new Error(`Message with ID ${messageId} not found`);
        }
        // Keep messages up to and including the target message
        this.currentSession.messages = this.currentSession.messages.slice(0, index + 1);
        this.currentSession.updatedAt = Date.now();
    }

    public updateMessageContent(messageId: string, content: string): void {
        const message = this.currentSession.messages.find(m => m.id === messageId);
        if (!message) {
            throw new Error(`Message with ID ${messageId} not found`);
        }
        message.content = content;
        this.currentSession.updatedAt = Date.now();
    }

    public getMessages(): ChatMessage[] {
        return this.currentSession.messages;
    }

    public getCurrentSessionId(): string {
        return this.currentSession.id;
    }

    /**
     * Prepare context for LLM (e.g. limit context window)
     */
    public getContextMetadata(): any {
        return {
            sessionId: this.currentSession.id,
            turnCount: this.currentSession.messages.length / 2
        };
    }
}
