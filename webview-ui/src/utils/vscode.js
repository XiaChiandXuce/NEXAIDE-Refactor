// Type-safe wrapper for VS Code Webview API
class VSCodeAPIWrapper {
    vsCodeApi;
    constructor() {
        // Prevent multiple acquisitions
        if (typeof acquireVsCodeApi === "function") {
            this.vsCodeApi = acquireVsCodeApi();
        }
        else {
            // Mock for browser dev environment
            this.vsCodeApi = {
                postMessage: (msg) => console.log('VSCode Mock Send:', msg),
                getState: () => ({}),
                setState: () => { }
            };
        }
    }
    postMessage(message) {
        this.vsCodeApi.postMessage(message);
    }
    onMessage(callback) {
        window.addEventListener('message', event => {
            const message = event.data;
            if (message && message.type) {
                callback(message);
            }
        });
    }
}
export const vscode = new VSCodeAPIWrapper();
//# sourceMappingURL=vscode.js.map