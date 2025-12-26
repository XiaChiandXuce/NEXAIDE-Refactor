"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFSM = void 0;
const events_1 = require("events");
class AgentFSM extends events_1.EventEmitter {
    currentState = 'IDLE';
    constructor() {
        super();
    }
    getState() {
        return this.currentState;
    }
    transition(newState) {
        // Simple validation logic (can be expanded with XState later)
        if (this.currentState === newState)
            return;
        console.log(`[FSM] State transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        this.emit('stateChanged', newState);
    }
    handleAction(action) {
        switch (action.type) {
            case 'SUBMIT_PROMPT':
                if (this.currentState === 'IDLE' || this.currentState === 'ERROR') {
                    this.transition('THINKING');
                }
                break;
            case 'STOP_GENERATION':
                if (this.currentState === 'THINKING' || this.currentState === 'WRITING') {
                    this.transition('IDLE');
                }
                break;
            case 'CLEAR_HISTORY':
                this.transition('IDLE');
                break;
        }
    }
}
exports.AgentFSM = AgentFSM;
//# sourceMappingURL=agentFsm.js.map