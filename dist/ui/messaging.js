"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
class MessagingService {
    onUserAction;
    view;
    disposables = [];
    constructor(onUserAction) {
        this.onUserAction = onUserAction;
    }
    attachWebview(view) {
        this.view = view;
        view.onDidReceiveMessage((message) => {
            // Runtime validation could happen here with Zod
            this.onUserAction(message);
        }, null, this.disposables);
    }
    send(message) {
        if (this.view) {
            this.view.postMessage(message);
        }
        else {
            console.warn('[Messaging] Webview not attached, dropping message:', message.type);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.view = undefined;
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=messaging.js.map