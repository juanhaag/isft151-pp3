import { WeatherData, Point } from '../types';
export interface MarineResponse {
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
export interface MeteoResponse {
    hourly: {
        time: string[];
        wind_speed_10m: number[];
        wind_direction_10m: number[];
    };
}
export declare class WeatherService {
    private static readonly MARINE_BASE_URL;
    private static readonly METEO_BASE_URL;
    getWeatherData(location: Point, forecastDays?: number): Promise<WeatherData>;
    private getMarineData;
    private getMeteoData;
    private mergeWeatherData;
    processWeatherData(weatherData: WeatherData): any;
}
//# sourceMappingURL=WeatherService.d.ts.map