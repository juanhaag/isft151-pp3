import { IAIProvider, AIProviderConfig } from './IAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { OllamaProvider, OllamaProviderConfig } from './OllamaProvider';

export enum AIProviderType {
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  CLAUDE = 'claude'
}

export class AIProviderFactory {
  static createProvider(type: AIProviderType, config: AIProviderConfig): IAIProvider {
    switch (type) {
      case AIProviderType.GEMINI:
        return new GeminiProvider(config);
      case AIProviderType.OLLAMA:
        return new OllamaProvider(config as OllamaProviderConfig);
      case AIProviderType.OPENAI:
        throw new Error('OpenAI provider not implemented yet');
      case AIProviderType.CLAUDE:
        throw new Error('Claude provider not implemented yet');
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }
}