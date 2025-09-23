import { IAIProvider, AIProviderConfig } from './IAIProvider';
import { GeminiProvider } from './GeminiProvider';

export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude'
}

export class AIProviderFactory {
  static createProvider(type: AIProviderType, config: AIProviderConfig): IAIProvider {
    switch (type) {
      case AIProviderType.GEMINI:
        return new GeminiProvider(config);
      case AIProviderType.OPENAI:
        throw new Error('OpenAI provider not implemented yet');
      case AIProviderType.CLAUDE:
        throw new Error('Claude provider not implemented yet');
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }
}