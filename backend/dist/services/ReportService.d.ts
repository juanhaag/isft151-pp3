import { AIProviderType } from '../strategy/AIProviderFactory';
import { IAIProvider } from '../strategy/IAIProvider';
import { Report, Spot, WeatherData } from '../entities';
export interface GenerateReportRequest {
    spotId: string;
    userPreferences?: string;
    aiProvider?: AIProviderType;
    forecastDays?: number;
}
export interface ReportServiceConfig {
    defaultAiProvider?: AIProviderType;
    defaultForecastDays?: number;
    maxForecastDays?: number;
}
export declare class ReportService {
    private openMeteoService;
    private spotRepository;
    private reportRepository;
    private zoneRepository;
    private aiProvider;
    private config;
    constructor(config?: ReportServiceConfig, aiProvider?: IAIProvider);
    generateReport(request: GenerateReportRequest): Promise<Report>;
    getReportById(reportId: string): Promise<Report | null>;
    getReportsBySpot(spotId: string, limit?: number): Promise<Report[]>;
    getRecentReports(limit?: number): Promise<Report[]>;
    getReportsByZone(zoneId: number, limit?: number): Promise<Report[]>;
    searchReports(searchTerm: string, limit?: number): Promise<Report[]>;
    getReportStats(): Promise<{
        total: number;
        thisWeek: number;
        thisMonth: number;
        averageReportsPerDay: number;
    }>;
    getReportsWithGoodConditions(minWaveHeight?: number): Promise<Report[]>;
    setAIProvider(provider: IAIProvider): void;
    setAIProviderByType(type: AIProviderType, apiKey?: string): void;
    getWeatherForecast(spotId: string, forecastDays?: number): Promise<{
        spot: Spot;
        weatherData: WeatherData;
        processedData: any;
    }>;
    testServices(): Promise<{
        openMeteo: boolean;
        database: boolean;
        ai: boolean;
    }>;
}
//# sourceMappingURL=ReportService.d.ts.map