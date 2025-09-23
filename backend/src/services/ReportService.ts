import { OpenMeteoService, Point } from './OpenMeteoService';
import { SpotRepository } from '../repositories/SpotRepository';
import { ReportRepository } from '../repositories/ReportRepository';
import { ZoneRepository } from '../repositories/ZoneRepository';
import { AIProviderFactory, AIProviderType } from '../strategy/AIProviderFactory';
import { IAIProvider } from '../strategy/IAIProvider';
import { Report, Spot, Zone, WeatherData } from '../entities';

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

export class ReportService {
  private openMeteoService: OpenMeteoService;
  private spotRepository: SpotRepository;
  private reportRepository: ReportRepository;
  private zoneRepository: ZoneRepository;
  private aiProvider: IAIProvider;
  private config: ReportServiceConfig;

  constructor(
    config: ReportServiceConfig = {},
    aiProvider?: IAIProvider
  ) {
    this.config = {
      defaultAiProvider: AIProviderType.GEMINI,
      defaultForecastDays: 7,
      maxForecastDays: 14,
      ...config
    };

    this.openMeteoService = new OpenMeteoService();
    this.spotRepository = new SpotRepository();
    this.reportRepository = new ReportRepository();
    this.zoneRepository = new ZoneRepository();

    this.aiProvider = aiProvider || AIProviderFactory.createProvider(
      this.config.defaultAiProvider!,
      { apiKey: process.env.GEMINI_API_KEY || '' }
    );
  }

  async generateReport(request: GenerateReportRequest): Promise<Report> {
    try {
      console.log(`🏄‍♂️ Generating surf report for spot: ${request.spotId}`);

      const { spotId, userPreferences, forecastDays = this.config.defaultForecastDays } = request;

      if (forecastDays! > this.config.maxForecastDays!) {
        throw new Error(`Forecast days cannot exceed ${this.config.maxForecastDays}`);
      }

      // Buscar el spot
      const spot = await this.spotRepository.findById(spotId);
      if (!spot) {
        throw new Error(`Spot with ID ${spotId} not found`);
      }

      console.log(`📍 Found spot: ${spot.display_name}`);

      // Obtener coordenadas del spot
      const coordinates = await this.spotRepository.getCoordinates(spotId);
      if (!coordinates) {
        throw new Error(`Could not get coordinates for spot ${spotId}`);
      }

      const location: Point = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };

      console.log(`🌊 Fetching weather data for location: ${location.latitude}, ${location.longitude}`);

      const weatherData = await this.openMeteoService.getCombinedWeatherDataWithFallback(location, forecastDays);

      // Procesar datos meteorológicos
      const processedData = this.openMeteoService.processWeatherData(weatherData);

      console.log(`📊 Weather data processed: ${processedData.summary.totalHours} hours of forecast`);

      // Obtener zona si no está cargada
      let zone = spot.zone;
      if (!zone && spot.zona_id) {
        zone = await this.zoneRepository.findById(spot.zona_id);
      }

      console.log(`🎯 Using AI provider to generate report...`);

      // Generar reporte con IA
      const reportText = await this.aiProvider.generateReport({
        weatherData,
        localidadNombre: spot.display_name,
        preferencias: userPreferences,
        zone: zone || undefined
      });

      console.log(`✅ AI report generated successfully`);

      // Guardar reporte en base de datos
      const report = await this.reportRepository.create({
        spot_id: spotId,
        report_text: reportText,
        weather_data: weatherData,
        user_preferences: userPreferences
      });

      console.log(`💾 Report saved to database with ID: ${report.id}`);

      return report;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportById(reportId: string): Promise<Report | null> {
    try {
      return await this.reportRepository.findById(reportId);
    } catch (error) {
      console.error('Error getting report by id:', error);
      throw new Error(`Failed to get report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportsBySpot(spotId: string, limit: number = 10): Promise<Report[]> {
    try {
      return await this.reportRepository.findBySpotId(spotId, limit);
    } catch (error) {
      console.error('Error getting reports by spot:', error);
      throw new Error(`Failed to get reports by spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecentReports(limit: number = 20): Promise<Report[]> {
    try {
      return await this.reportRepository.findRecent(limit);
    } catch (error) {
      console.error('Error getting recent reports:', error);
      throw new Error(`Failed to get recent reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportsByZone(zoneId: number, limit: number = 20): Promise<Report[]> {
    try {
      return await this.reportRepository.findByZone(zoneId, limit);
    } catch (error) {
      console.error('Error getting reports by zone:', error);
      throw new Error(`Failed to get reports by zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchReports(searchTerm: string, limit: number = 20): Promise<Report[]> {
    try {
      return await this.reportRepository.searchByContent(searchTerm, limit);
    } catch (error) {
      console.error('Error searching reports:', error);
      throw new Error(`Failed to search reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportStats(): Promise<{
    total: number;
    thisWeek: number;
    thisMonth: number;
    averageReportsPerDay: number;
  }> {
    try {
      return await this.reportRepository.getReportStats();
    } catch (error) {
      console.error('Error getting report stats:', error);
      throw new Error(`Failed to get report stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportsWithGoodConditions(minWaveHeight: number = 1.0): Promise<Report[]> {
    try {
      return await this.reportRepository.findReportsWithGoodConditions(minWaveHeight);
    } catch (error) {
      console.error('Error getting reports with good conditions:', error);
      throw new Error(`Failed to get reports with good conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Método para cambiar el proveedor de IA
  setAIProvider(provider: IAIProvider): void {
    this.aiProvider = provider;
  }

  // Método para cambiar el proveedor de IA por tipo
  setAIProviderByType(type: AIProviderType, apiKey?: string): void {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.aiProvider = AIProviderFactory.createProvider(type, { apiKey: key });
  }

  // Método para obtener el pronóstico meteorológico sin generar reporte
  async getWeatherForecast(spotId: string, forecastDays: number = 7): Promise<{
    spot: Spot;
    weatherData: WeatherData;
    processedData: any;
  }> {
    try {
      const spot = await this.spotRepository.findById(spotId);
      if (!spot) {
        throw new Error(`Spot with ID ${spotId} not found`);
      }

      const coordinates = await this.spotRepository.getCoordinates(spotId);
      if (!coordinates) {
        throw new Error(`Could not get coordinates for spot ${spotId}`);
      }

      const location: Point = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };

      const weatherData = await this.openMeteoService.getCombinedWeatherDataWithFallback(location, forecastDays);
      const processedData = this.openMeteoService.processWeatherData(weatherData);

      return {
        spot,
        weatherData,
        processedData
      };
    } catch (error) {
      console.error('Error getting weather forecast:', error);
      throw new Error(`Failed to get weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testServices(): Promise<{
    openMeteo: boolean;
    database: boolean;
    ai: boolean;
  }> {
    const results = {
      openMeteo: false,
      database: false,
      ai: false
    };

    try {
      results.openMeteo = await this.openMeteoService.testConnection();
    } catch (error) {
      console.error('Open Meteo test failed:', error);
    }

    try {
      await this.spotRepository.findAll();
      results.database = true;
    } catch (error) {
      console.error('Database test failed:', error);
    }

    try {
      if (this.aiProvider) {
        results.ai = true;
      }
    } catch (error) {
      console.error('AI provider test failed:', error);
    }

    return results;
  }
}