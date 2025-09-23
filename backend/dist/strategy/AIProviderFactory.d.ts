import { IAIProvider, AIProviderConfig } from './IAIProvider';
export declare enum AIProviderType {
    GEMINI = "gemini",
    OPENAI = "openai",
    CLAUDE = "claude"
}
export declare class AIProviderFactory {
    static createProvider(type: AIProviderType, config: AIProviderConfig): IAIProvider;
}
//# sourceMappingURL=AIProviderFactory.d.ts.map