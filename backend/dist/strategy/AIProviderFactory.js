"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderFactory = exports.AIProviderType = void 0;
const GeminiProvider_1 = require("./GeminiProvider");
var AIProviderType;
(function (AIProviderType) {
    AIProviderType["GEMINI"] = "gemini";
    AIProviderType["OPENAI"] = "openai";
    AIProviderType["CLAUDE"] = "claude";
})(AIProviderType || (exports.AIProviderType = AIProviderType = {}));
class AIProviderFactory {
    static createProvider(type, config) {
        switch (type) {
            case AIProviderType.GEMINI:
                return new GeminiProvider_1.GeminiProvider(config);
            case AIProviderType.OPENAI:
                throw new Error('OpenAI provider not implemented yet');
            case AIProviderType.CLAUDE:
                throw new Error('Claude provider not implemented yet');
            default:
                throw new Error(`Unknown AI provider type: ${type}`);
        }
    }
}
exports.AIProviderFactory = AIProviderFactory;
//# sourceMappingURL=AIProviderFactory.js.map