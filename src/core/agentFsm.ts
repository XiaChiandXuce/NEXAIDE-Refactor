
import { AgentState, AgentEvent, UserAction } from '../api/types';
import { EventEmitter } from 'events';

export class AgentFSM extends EventEmitter {
    private currentState: AgentState = 'IDLE';

    constructor() {
        super();
    }

    public getState(): AgentState {
        return this.currentState;
    }

    public transition(newState: AgentState) {
        // Simple validation logic (can be expanded with XState later)
        if (this.currentState === newState) return;

        console.log(`[FSM] State transition: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        this.emit('stateChanged', newState);
    }

    public handleAction(action: UserAction) {
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
