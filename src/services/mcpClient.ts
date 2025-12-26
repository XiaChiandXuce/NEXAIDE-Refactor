
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

export class McpClientService {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
    private pythonPath: string;
    private scriptPath: string;

    constructor(pythonPath: string, scriptPath: string) {
        this.pythonPath = pythonPath;
        this.scriptPath = scriptPath;
    }

    public async connect(): Promise<boolean> {
        try {
            this.transport = new StdioClientTransport({
                command: this.pythonPath,
                args: [this.scriptPath],
                stderr: 'ignore'
            });

            this.client = new Client({
                name: 'nexaide-client',
                version: '1.0.0'
            }, {
                capabilities: {
                    roots: { listChanged: true } // Standard capabilities
                }
            });

            await this.client.connect(this.transport);
            return true;
        } catch (error) {
            console.error('Failed to connect to MCP server:', error);
            return false;
        }
    }

    public async callTool(name: string, args: any): Promise<any> {
        if (!this.client) throw new Error('Client not connected');
        return this.client.callTool({
            name,
            arguments: args
        });
    }

    public async listTools(): Promise<any> {
        if (!this.client) throw new Error('Client not connected');
        return this.client.listTools();
    }

    public dispose() {
        this.transport?.close();
    }
}
