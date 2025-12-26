"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const uuid_1 = require("uuid");
class SessionManager {
    currentSession;
    history = [];
    constructor() {
        this.currentSession = this.createNewSession();
    }
    createNewSession() {
        const now = Date.now();
        return {
            id: (0, uuid_1.v4)(),
            messages: [],
            createdAt: now,
            updatedAt: now
        };
    }
    startNewSession() {
        if (this.currentSession.messages.length > 0) {
            this.history.push(this.currentSession);
        }
        this.currentSession = this.createNewSession();
    }
    addMessage(role, content) {
        const msg = {
            id: (0, uuid_1.v4)(),
            role,
            content,
            timestamp: Date.now()
        };
        this.currentSession.messages.push(msg);
        this.currentSession.updatedAt = Date.now();
        return msg;
    }
    getMessages() {
        return this.currentSession.messages;
    }
    getCurrentSessionId() {
        return this.currentSession.id;
    }
    /**
     * Prepare context for LLM (e.g. limit context window)
     */
    getContextMetadata() {
        return {
            sessionId: this.currentSession.id,
            turnCount: this.currentSession.messages.length / 2
        };
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=sessionManager.js.map