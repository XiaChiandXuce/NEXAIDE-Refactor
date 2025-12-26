
import * as vscode from 'vscode';

export interface AgentConfig {
    apiUrl: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    agentMode: 'cli' | 'mcp';
}

export class ConfigManager {
    private static readonly SECTION = 'nexaide';

    public getConfig(): AgentConfig {
        const config = vscode.workspace.getConfiguration(ConfigManager.SECTION);

        return {
            apiUrl: config.get<string>('apiUrl') ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            apiKey: config.get<string>('apiKey') ?? process.env.DASHSCOPE_API_KEY ?? '',
            model: config.get<string>('model') ?? 'qwen-plus',
            temperature: config.get<number>('temperature') ?? 0.7,
            maxTokens: config.get<number>('maxTokens') ?? 2048,
            agentMode: config.get<'cli' | 'mcp'>('agentMode') ?? 'mcp'
        };
    }

    public async updateConfig(key: keyof AgentConfig, value: any) {
        const config = vscode.workspace.getConfiguration(ConfigManager.SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
}
