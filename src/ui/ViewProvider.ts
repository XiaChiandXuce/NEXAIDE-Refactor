
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MessagingService } from './messaging';
import { AgentFSM } from '../core/agentFsm';
import { ConfigManager } from '../core/configManager';
import { SessionManager } from '../core/sessionManager';
import { LLMClient } from '../api/llmClient';
import { McpClientService } from '../services/mcpClient';
import { UserAction } from '../api/types';

export class AIChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'nexaide.chatView';

    private messaging: MessagingService;
    private fsm: AgentFSM;
    private config: ConfigManager;
    private session: SessionManager;
    private llm: LLMClient;
    private mcp: McpClientService | null = null;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {
        this.config = new ConfigManager();
        this.fsm = new AgentFSM();
        this.session = new SessionManager();
        this.llm = new LLMClient();

        // Wire up the controller logic
        this.messaging = new MessagingService(this.handleUserAction.bind(this));

        // Listen for internal state changes
        this.fsm.on('stateChanged', (state) => {
            this.messaging.send({ type: 'STATE_CHANGED', newState: state });
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this.messaging.attachWebview(webviewView.webview);
    }

    private async handleUserAction(action: UserAction) {
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

    private async handleSubmit(content: string) {
        if (this.fsm.getState() !== 'IDLE') return;

        this.fsm.transition('THINKING');
        this.session.addMessage('user', content);

        // Optimistic UI update
        this.messaging.send({ type: 'APPEND_TEXT', text: `\n> ${content}\n` });

        const cfg = this.config.getConfig();

        try {
            await this.llm.streamChat(
                cfg.apiUrl,
                cfg.apiKey,
                {
                    model: cfg.model,
                    messages: this.session.getMessages().map(m => ({ role: m.role, content: m.content })),
                    temperature: cfg.temperature
                },
                {
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
                }
            );
        } catch (e) {
            this.fsm.transition('ERROR');
        }
    }

    private handleStop() {
        // Logic to abort LLM request would go here (need to expose AbortController in LLMClient)
        this.fsm.transition('IDLE');
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
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
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data: https:;">
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

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
