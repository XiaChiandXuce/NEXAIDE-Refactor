
import * as vscode from 'vscode';
import { ToWebviewMessage, UserAction } from '../api/types';

export class MessagingService {
    private view: vscode.Webview | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly onUserAction: (action: UserAction) => void
    ) { }

    public attachWebview(view: vscode.Webview) {
        this.view = view;

        view.onDidReceiveMessage(
            (message: any) => {
                // Runtime validation could happen here with Zod
                this.onUserAction(message as UserAction);
            },
            null,
            this.disposables
        );
    }

    public send(message: ToWebviewMessage) {
        if (this.view) {
            this.view.postMessage(message);
        } else {
            console.warn('[Messaging] Webview not attached, dropping message:', message.type);
        }
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.view = undefined;
    }
}
