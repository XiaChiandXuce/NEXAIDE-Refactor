import { ILLMProvider, LLMRequest } from '../types';

export abstract class BaseProvider implements ILLMProvider {
    abstract id: string;

    constructor() { }

    abstract initialize(): Promise<void>;

    abstract streamChat(request: LLMRequest, onChunk: (chunk: string) => void): Promise<void>;

    abstract chat(request: LLMRequest): Promise<string>;

    protected getApiKey(envVarName: string): string {
        // Priority: Process Env (for development/testing)
        // In a real VS Code extension, this would also check vscode.workspace.getConfiguration()
        const key = process.env[envVarName];
        if (!key) {
            throw new Error(`Missing environment variable: ${envVarName}`);
        }
        return key;
    }
}
