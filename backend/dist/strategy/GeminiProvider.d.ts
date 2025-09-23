import { IAIProvider, AIProviderConfig, ReportRequest } from './IAIProvider';
export declare class GeminiProvider implements IAIProvider {
    private apiKey;
    private model;
    constructor(config: AIProviderConfig);
    generateReport(request: ReportRequest): Promise<string>;
}
//# sourceMappingURL=GeminiProvider.d.ts.map