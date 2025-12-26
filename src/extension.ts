
import * as vscode from 'vscode';
import { AIChatViewProvider } from './ui/ViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('[NEXAIDE] Activating extension...');

    const provider = new AIChatViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(AIChatViewProvider.viewType, provider, {
            webviewOptions: { retainContextWhenHidden: true }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('nexaide.openChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.nexaide-sidebar');
        })
    );

    console.log('[NEXAIDE] Activation complete.');
}

export function deactivate() {
    // Cleanup services if needed
}
