"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const messaging_1 = require("./messaging");
const agentFsm_1 = require("../core/agentFsm");
const configManager_1 = require("../core/configManager");
const sessionManager_1 = require("../core/sessionManager");
const llmClient_1 = require("../api/llmClient");
class AIChatViewProvider {
    _extensionUri;
    static viewType = 'nexaide.chatView';
    messaging;
    fsm;
    config;
    session;
    llm;
    mcp = null;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.config = new configManager_1.ConfigManager();
        this.fsm = new agentFsm_1.AgentFSM();
        this.session = new sessionManager_1.SessionManager();
        this.llm = new llmClient_1.LLMClient();
        // Wire up the controller logic
        this.messaging = new messaging_1.MessagingService(this.handleUserAction.bind(this));
        // Listen for internal state changes
        this.fsm.on('stateChanged', (state) => {
            this.messaging.send({ type: 'STATE_CHANGED', newState: state });
        });
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this.messaging.attachWebview(webviewView.webview);
    }
    async handleUserAction(action) {
        console.log('[Controller] User Action:', action.type);
        switch (action.type) {
            case 'SUBMIT_PROMPT':
                await this.handleSubmit(action.content);
                break;
            case 'STOP_GENERATION':
                this.handleStop();
                break;
            case 'CLEAR_HISTORY':
                this.session.startNewSession();
                this.messaging.send({ type: 'REPLACE_TEXT', text: '' });
                break;
        }
    }
    async handleSubmit(content) {
        if (this.fsm.getState() !== 'IDLE')
            return;
        this.fsm.transition('THINKING');
        this.session.addMessage('user', content);
        // Optimistic UI update
        this.messaging.send({ type: 'APPEND_TEXT', text: `\n> ${content}\n` });
        const cfg = this.config.getConfig();
        try {
            await this.llm.streamChat(cfg.apiUrl, cfg.apiKey, {
                model: cfg.model,
                messages: this.session.getMessages().map(m => ({ role: m.role, content: m.content })),
                temperature: cfg.temperature
            }, {
                onToken: (token) => {
                    this.fsm.transition('WRITING');
                    this.messaging.send({ type: 'APPEND_TEXT', text: token });
                },
                onError: (err) => {
                    this.fsm.transition('ERROR');
                    this.messaging.send({ type: 'ERROR', message: err.message });
                },
                onDone: () => {
                    this.fsm.transition('IDLE');
                    this.messaging.send({ type: 'DONE' });
                }
            });
        }
        catch (e) {
            this.fsm.transition('ERROR');
        }
    }
    handleStop() {
        // Logic to abort LLM request would go here (need to expose AbortController in LLMClient)
        this.fsm.transition('IDLE');
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.css"));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.js"));
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <title>NEXAIDE</title>
        </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
exports.AIChatViewProvider = AIChatViewProvider;
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=ViewProvider.js.map