"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpClientService = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
class McpClientService {
    client = null;
    transport = null;
    pythonPath;
    scriptPath;
    constructor(pythonPath, scriptPath) {
        this.pythonPath = pythonPath;
        this.scriptPath = scriptPath;
    }
    async connect() {
        try {
            this.transport = new stdio_js_1.StdioClientTransport({
                command: this.pythonPath,
                args: [this.scriptPath],
                stderr: 'ignore'
            });
            this.client = new index_js_1.Client({
                name: 'nexaide-client',
                version: '1.0.0'
            }, {
                capabilities: {
                    roots: { listChanged: true } // Standard capabilities
                }
            });
            await this.client.connect(this.transport);
            return true;
        }
        catch (error) {
            console.error('Failed to connect to MCP server:', error);
            return false;
        }
    }
    async callTool(name, args) {
        if (!this.client)
            throw new Error('Client not connected');
        return this.client.callTool({
            name,
            arguments: args
        });
    }
    async listTools() {
        if (!this.client)
            throw new Error('Client not connected');
        return this.client.listTools();
    }
    dispose() {
        this.transport?.close();
    }
}
exports.McpClientService = McpClientService;
//# sourceMappingURL=mcpClient.js.map