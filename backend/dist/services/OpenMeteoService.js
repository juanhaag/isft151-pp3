"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenMeteoService = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const dotenv_1 = __importDefault(require("dotenv"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
dotenv_1.default.config();
class OpenMeteoService {
    constructor() {
        console.log('🌊 OpenMeteoService constructor - Environment variables:');
        console.log('  OPEN_METEO_MARINE_URL:', process.env.OPEN_METEO_MARINE_URL);
        console.log('  OPEN_METEO_FORECAST_URL:', process.env.OPEN_METEO_FORECAST_URL);
        this.config = {
            marineUrl: process.env.OPEN_METEO_MARINE_URL || 'https://marine-api.open-meteo.com/v1/marine',
            forecastUrl: process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast',
            timeout: 45000 // Increased to 45 seconds to handle network issues
        };
        console.log('🌊 OpenMeteoService config:', this.config);
        this.marineClient = axios_1.default.create({
            baseURL: this.config.marineUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SurfReportAPI/1.0',
                'Accept': 'application/json'
            },
            maxRedirects: 5,
            validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            // Add connection reuse and keepAlive
            httpsAgent: new https_1.default.Agent({
                keepAlive: true,
                maxSockets: 10,
                maxFreeSockets: 10,
                timeout: this.config.timeout
            }),
            httpAgent: new http_1.default.Agent({
                keepAlive: true,
                maxSockets: 10,
                maxFreeSockets: 10,
                timeout: this.config.timeout
            })
        });
        this.forecastClient = axios_1.default.create({
            baseURL: this.config.forecastUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SurfReportAPI/1.0',
                'Accept': 'application/json'
            },
            maxRedirects: 5,
            validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            // Add connection reuse and keepAlive
            httpsAgent: new https_1.default.Agent({
                keepAlive: true,
                maxSockets: 10,
                maxFreeSockets: 10,
                timeout: this.config.timeout
            }),
            httpAgent: new http_1.default.Agent({
                keepAlive: true,
                maxSockets: 10,
                maxFreeSockets: 10,
                timeout: this.config.timeout
            })
        });
        this.setupInterceptors();
    }
    async retryRequest(requestFn, operation, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                // Log detailed error information
                console.error(`❌ Attempt ${attempt}/${maxRetries} failed for ${operation}:`, {
                    message: lastError.message,
                    code: error?.code,
                    status: error?.response?.status,
                    url: error?.config?.url
                });
                if (attempt === maxRetries) {
                    console.error(`❌ All ${maxRetries} attempts failed for ${operation}:`, lastError.message);
                    break;
                }
                // Calculate exponential backoff with jitter
                const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10s
                const jitter = Math.random() * 1000; // Add up to 1s random delay
                const delay = baseDelay + jitter;
                console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for ${operation}, retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error(`Failed to fetch ${operation}: ${lastError?.message || 'Unknown error'}`);
    }
    setupInterceptors() {
        // Request interceptor para logging
        const requestInterceptor = (config) => {
            console.log(`🌊 Making request to ${config.url}`);
            return config;
        };
        // Response interceptor para manejo de errores
        const responseErrorInterceptor = (error) => {
            console.error('❌ Open Meteo API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message
            });
            return Promise.reject(error);
        };
        this.marineClient.interceptors.request.use(requestInterceptor);
        this.marineClient.interceptors.response.use(undefined, responseErrorInterceptor);
        this.forecastClient.interceptors.request.use(requestInterceptor);
        this.forecastClient.interceptors.response.use(undefined, responseErrorInterceptor);
    }
    // Método de fallback usando curl cuando axios falla
    async fetchWithCurl(url) {
        try {
            console.log(`🔧 Using curl fallback for: ${url}`);
            const { stdout } = await execAsync(`curl -s --connect-timeout 30 --max-time 60 "${url}"`);
            if (!stdout) {
                throw new Error('Empty response from curl');
            }
            return JSON.parse(stdout);
        }
        catch (error) {
            throw new Error(`Curl fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getMarineData(location, forecastDays = 7) {
        return this.retryRequest(async () => {
            console.log(`🌊 Fetching marine data for ${location.latitude}, ${location.longitude}`);
            try {
                // First try with axios
                const response = await this.marineClient.get('', {
                    params: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        hourly: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period',
                        forecast_days: forecastDays,
                        timezone: 'auto'
                    }
                });
                if (response.status !== 200) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.data;
            }
            catch (axiosError) {
                console.warn(`⚠️ Axios failed for marine data, trying curl fallback...`);
                // Fallback to curl
                const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&forecast_days=${forecastDays}&timezone=auto`;
                return await this.fetchWithCurl(url);
            }
        }, 'marine data');
    }
    async getForecastData(location, forecastDays = 7) {
        return this.retryRequest(async () => {
            console.log(`🌡️ Fetching forecast data for ${location.latitude}, ${location.longitude}`);
            try {
                // First try with axios
                const response = await this.forecastClient.get('', {
                    params: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        hourly: 'wind_speed_10m,wind_direction_10m',
                        forecast_days: forecastDays,
                        timezone: 'auto'
                    }
                });
                if (response.status !== 200) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.data;
            }
            catch (axiosError) {
                console.warn(`⚠️ Axios failed for forecast data, trying curl fallback...`);
                // Fallback to curl
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=wind_speed_10m,wind_direction_10m&forecast_days=${forecastDays}&timezone=auto`;
                return await this.fetchWithCurl(url);
            }
        }, 'forecast data');
    }
    async getCombinedWeatherData(location, forecastDays = 7) {
        try {
            console.log(`🌍 Fetching weather data for lat: ${location.latitude}, lon: ${location.longitude}`);
            // Try to fetch both datasets with a longer timeout for problematic networks
            const timeout = setTimeout(() => {
                console.warn(`⚠️ Weather data request taking longer than expected for ${location.latitude}, ${location.longitude}`);
            }, 30000);
            const [marineData, forecastData] = await Promise.all([
                this.getMarineData(location, forecastDays),
                this.getForecastData(location, forecastDays)
            ]);
            clearTimeout(timeout);
            return this.combineWeatherData(marineData, forecastData);
        }
        catch (error) {
            console.error('Error getting combined weather data:', error);
            // Try to provide more specific error information
            const errorMessage = this.getDetailedErrorMessage(error);
            throw new Error(`Failed to get weather data: ${errorMessage}`);
        }
    }
    getDetailedErrorMessage(error) {
        if (error?.code === 'ETIMEDOUT') {
            return 'Network timeout - the weather service is taking too long to respond. This might be due to network issues or high server load.';
        }
        if (error?.code === 'ECONNREFUSED') {
            return 'Connection refused - unable to connect to the weather service.';
        }
        if (error?.code === 'ENOTFOUND') {
            return 'DNS resolution failed - unable to resolve weather service domain.';
        }
        if (error?.response?.status) {
            return `Weather service returned HTTP ${error.response.status}: ${error.response.statusText}`;
        }
        return error instanceof Error ? error.message : 'Unknown network error';
    }
    combineWeatherData(marineData, forecastData) {
        const marine = marineData.hourly;
        const forecast = forecastData.hourly;
        // Validar que los arrays tengan la misma longitud
        const minLength = Math.min(marine.time.length, forecast.time.length);
        return {
            time: marine.time.slice(0, minLength),
            wave_height: marine.wave_height.slice(0, minLength),
            wave_direction: marine.wave_direction.slice(0, minLength),
            wave_period: marine.wave_period.slice(0, minLength),
            swell_wave_height: marine.swell_wave_height.slice(0, minLength),
            swell_wave_direction: marine.swell_wave_direction.slice(0, minLength),
            swell_wave_period: marine.swell_wave_period.slice(0, minLength),
            wind_speed_10m: forecast.wind_speed_10m.slice(0, minLength),
            wind_direction_10m: forecast.wind_direction_10m.slice(0, minLength)
        };
    }
    async getLocationInfo(location) {
        try {
            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                current: 'temperature_2m',
                forecast_days: 1
            };
            const response = await this.forecastClient.get('', { params });
            return {
                timezone: response.data.timezone,
                elevation: response.data.elevation
            };
        }
        catch (error) {
            console.warn('Could not fetch location info, using defaults');
            return { timezone: 'auto' };
        }
    }
    processWeatherData(weatherData) {
        const processedData = {
            forecast: [],
            summary: {
                avgWaveHeight: 0,
                maxWaveHeight: 0,
                avgSwellHeight: 0,
                maxSwellHeight: 0,
                avgWindSpeed: 0,
                maxWindSpeed: 0,
                totalHours: weatherData.time.length
            }
        };
        const length = weatherData.time.length;
        let totalWaveHeight = 0;
        let totalSwellHeight = 0;
        let totalWindSpeed = 0;
        let maxWave = 0;
        let maxSwell = 0;
        let maxWind = 0;
        for (let i = 0; i < length; i++) {
            const waveHeight = weatherData.wave_height[i] || 0;
            const swellHeight = weatherData.swell_wave_height[i] || 0;
            const windSpeed = weatherData.wind_speed_10m[i] || 0;
            totalWaveHeight += waveHeight;
            totalSwellHeight += swellHeight;
            totalWindSpeed += windSpeed;
            maxWave = Math.max(maxWave, waveHeight);
            maxSwell = Math.max(maxSwell, swellHeight);
            maxWind = Math.max(maxWind, windSpeed);
            processedData.forecast.push({
                time: weatherData.time[i],
                waveHeight,
                waveDirection: weatherData.wave_direction[i],
                wavePeriod: weatherData.wave_period[i],
                swellHeight,
                swellDirection: weatherData.swell_wave_direction[i],
                swellPeriod: weatherData.swell_wave_period[i],
                windSpeed,
                windDirection: weatherData.wind_direction_10m[i],
                surfCondition: this.calculateSurfCondition(waveHeight, swellHeight, windSpeed)
            });
        }
        processedData.summary = {
            avgWaveHeight: Number((totalWaveHeight / length).toFixed(2)),
            maxWaveHeight: Number(maxWave.toFixed(2)),
            avgSwellHeight: Number((totalSwellHeight / length).toFixed(2)),
            maxSwellHeight: Number(maxSwell.toFixed(2)),
            avgWindSpeed: Number((totalWindSpeed / length).toFixed(2)),
            maxWindSpeed: Number(maxWind.toFixed(2)),
            totalHours: length
        };
        return processedData;
    }
    calculateSurfCondition(waveHeight, swellHeight, windSpeed) {
        const totalWaveHeight = Math.max(waveHeight, swellHeight);
        if (totalWaveHeight < 0.5)
            return 'flat';
        if (totalWaveHeight < 1)
            return 'small';
        if (totalWaveHeight < 1.5)
            return 'medium';
        if (totalWaveHeight < 2.5)
            return 'good';
        if (totalWaveHeight < 3.5)
            return 'excellent';
        return 'epic';
    }
    // Método para testing con fallback
    async testConnection() {
        try {
            // Test with minimal data first
            await this.getCombinedWeatherData({ latitude: -38.5741, longitude: -58.6901 }, 1);
            return true;
        }
        catch (error) {
            console.error('Open Meteo connection test failed:', error);
            return false;
        }
    }
    // Método de respaldo que intenta con menos días de pronóstico
    async getCombinedWeatherDataWithFallback(location, forecastDays = 7) {
        try {
            return await this.getCombinedWeatherData(location, forecastDays);
        }
        catch (error) {
            console.warn(`⚠️ Failed to get ${forecastDays} days forecast, trying with fewer days...`);
            // Try with progressively fewer days
            const fallbackDays = [5, 3, 1];
            for (const days of fallbackDays) {
                if (days >= forecastDays)
                    continue; // Skip if not actually reducing
                try {
                    console.log(`🔄 Attempting with ${days} days forecast...`);
                    return await this.getCombinedWeatherData(location, days);
                }
                catch (fallbackError) {
                    console.warn(`⚠️ Failed with ${days} days, trying next fallback...`);
                }
            }
            // If all fallbacks fail, throw the original error
            throw error;
        }
    }
}
exports.OpenMeteoService = OpenMeteoService;
//# sourceMappingURL=OpenMeteoService.js.map