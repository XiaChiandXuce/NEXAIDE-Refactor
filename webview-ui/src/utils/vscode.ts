import type { ToWebviewMessage, UserAction } from "../common/types";

declare function acquireVsCodeApi(): any;


// Type-safe wrapper for VS Code Webview API
class VSCodeAPIWrapper {
    private readonly vsCodeApi: ReturnType<typeof acquireVsCodeApi>;

    constructor() {
        // Prevent multiple acquisitions
        if (typeof acquireVsCodeApi === "function") {
            this.vsCodeApi = acquireVsCodeApi();
        } else {
            // Mock for browser dev environment
            this.vsCodeApi = {
                postMessage: (msg: any) => console.log('VSCode Mock Send:', msg),
                getState: () => ({}),
                setState: () => { }
            } as any;
        }
    }

    public postMessage(message: UserAction) {
        this.vsCodeApi.postMessage(message);
    }

    public onMessage(callback: (message: ToWebviewMessage) => void) {
        window.addEventListener('message', event => {
            const message = event.data;
            if (message && message.type) {
                callback(message as ToWebviewMessage);
            }
        });
    }
}

export const vscode = new VSCodeAPIWrapper();
