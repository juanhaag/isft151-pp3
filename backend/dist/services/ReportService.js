"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const OpenMeteoService_1 = require("./OpenMeteoService");
const SpotRepository_1 = require("../repositories/SpotRepository");
const ReportRepository_1 = require("../repositories/ReportRepository");
const ZoneRepository_1 = require("../repositories/ZoneRepository");
const AIProviderFactory_1 = require("../strategy/AIProviderFactory");
class ReportService {
    constructor(config = {}, aiProvider) {
        this.config = {
            defaultAiProvider: AIProviderFactory_1.AIProviderType.GEMINI,
            defaultForecastDays: 7,
            maxForecastDays: 14,
            ...config
        };
        this.openMeteoService = new OpenMeteoService_1.OpenMeteoService();
        this.spotRepository = new SpotRepository_1.SpotRepository();
        this.reportRepository = new ReportRepository_1.ReportRepository();
        this.zoneRepository = new ZoneRepository_1.ZoneRepository();
        this.aiProvider = aiProvider || AIProviderFactory_1.AIProviderFactory.createProvider(this.config.defaultAiProvider, { apiKey: process.env.GEMINI_API_KEY || '' });
    }
    async generateReport(request) {
        try {
            console.log(`🏄‍♂️ Generating surf report for spot: ${request.spotId}`);
            const { spotId, userPreferences, forecastDays = this.config.defaultForecastDays } = request;
            // Validar forecastDays
            if (forecastDays > this.config.maxForecastDays) {
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
            const location = {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            };
            console.log(`🌊 Fetching weather data for location: ${location.latitude}, ${location.longitude}`);
            // Obtener datos meteorológicos con fallback
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
        }
        catch (error) {
            console.error('❌ Error generating report:', error);
            throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportById(reportId) {
        try {
            return await this.reportRepository.findById(reportId);
        }
        catch (error) {
            console.error('Error getting report by id:', error);
            throw new Error(`Failed to get report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportsBySpot(spotId, limit = 10) {
        try {
            return await this.reportRepository.findBySpotId(spotId, limit);
        }
        catch (error) {
            console.error('Error getting reports by spot:', error);
            throw new Error(`Failed to get reports by spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getRecentReports(limit = 20) {
        try {
            return await this.reportRepository.findRecent(limit);
        }
        catch (error) {
            console.error('Error getting recent reports:', error);
            throw new Error(`Failed to get recent reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportsByZone(zoneId, limit = 20) {
        try {
            return await this.reportRepository.findByZone(zoneId, limit);
        }
        catch (error) {
            console.error('Error getting reports by zone:', error);
            throw new Error(`Failed to get reports by zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchReports(searchTerm, limit = 20) {
        try {
            return await this.reportRepository.searchByContent(searchTerm, limit);
        }
        catch (error) {
            console.error('Error searching reports:', error);
            throw new Error(`Failed to search reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportStats() {
        try {
            return await this.reportRepository.getReportStats();
        }
        catch (error) {
            console.error('Error getting report stats:', error);
            throw new Error(`Failed to get report stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportsWithGoodConditions(minWaveHeight = 1.0) {
        try {
            return await this.reportRepository.findReportsWithGoodConditions(minWaveHeight);
        }
        catch (error) {
            console.error('Error getting reports with good conditions:', error);
            throw new Error(`Failed to get reports with good conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Método para cambiar el proveedor de IA
    setAIProvider(provider) {
        this.aiProvider = provider;
    }
    // Método para cambiar el proveedor de IA por tipo
    setAIProviderByType(type, apiKey) {
        const key = apiKey || process.env.GEMINI_API_KEY || '';
        this.aiProvider = AIProviderFactory_1.AIProviderFactory.createProvider(type, { apiKey: key });
    }
    // Método para obtener el pronóstico meteorológico sin generar reporte
    async getWeatherForecast(spotId, forecastDays = 7) {
        try {
            const spot = await this.spotRepository.findById(spotId);
            if (!spot) {
                throw new Error(`Spot with ID ${spotId} not found`);
            }
            const coordinates = await this.spotRepository.getCoordinates(spotId);
            if (!coordinates) {
                throw new Error(`Could not get coordinates for spot ${spotId}`);
            }
            const location = {
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
        }
        catch (error) {
            console.error('Error getting weather forecast:', error);
            throw new Error(`Failed to get weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Método para testing
    async testServices() {
        const results = {
            openMeteo: false,
            database: false,
            ai: false
        };
        try {
            // Test Open Meteo service
            results.openMeteo = await this.openMeteoService.testConnection();
        }
        catch (error) {
            console.error('Open Meteo test failed:', error);
        }
        try {
            // Test database connection
            await this.spotRepository.findAll();
            results.database = true;
        }
        catch (error) {
            console.error('Database test failed:', error);
        }
        try {
            // Test AI provider (simple test)
            if (this.aiProvider) {
                results.ai = true;
            }
        }
        catch (error) {
            console.error('AI provider test failed:', error);
        }
        return results;
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=ReportService.js.map