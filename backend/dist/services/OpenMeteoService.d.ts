import { WeatherData } from '../entities';
export interface Point {
    latitude: number;
    longitude: number;
}
export interface OpenMeteoMarineResponse {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    hourly_units: {
        time: string;
        wave_height: string;
        wave_direction: string;
        wave_period: string;
        swell_wave_height: string;
        swell_wave_direction: string;
        swell_wave_period: string;
    };
    hourly: {
        time: string[];
        wave_height: number[];
        wave_direction: number[];
        wave_period: number[];
        swell_wave_height: number[];
        swell_wave_direction: number[];
        swell_wave_period: number[];
    };
}
export interface OpenMeteoForecastResponse {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    hourly_units: {
        time: string;
        wind_speed_10m: string;
        wind_direction_10m: string;
    };
    hourly: {
        time: string[];
        wind_speed_10m: number[];
        wind_direction_10m: number[];
    };
}
export interface OpenMeteoConfig {
    marineUrl: string;
    forecastUrl: string;
    timeout?: number;
}
export declare class OpenMeteoService {
    private marineClient;
    private forecastClient;
    private config;
    constructor();
    private retryRequest;
    private setupInterceptors;
    private fetchWithCurl;
    getMarineData(location: Point, forecastDays?: number): Promise<OpenMeteoMarineResponse>;
    getForecastData(location: Point, forecastDays?: number): Promise<OpenMeteoForecastResponse>;
    getCombinedWeatherData(location: Point, forecastDays?: number): Promise<WeatherData>;
    private getDetailedErrorMessage;
    private combineWeatherData;
    getLocationInfo(location: Point): Promise<{
        timezone: string;
        elevation?: number;
    }>;
    processWeatherData(weatherData: WeatherData): any;
    private calculateSurfCondition;
    testConnection(): Promise<boolean>;
    getCombinedWeatherDataWithFallback(location: Point, forecastDays?: number): Promise<WeatherData>;
}
//# sourceMappingURL=OpenMeteoService.d.ts.map