import { Spot } from './Spot';
export interface WeatherData {
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    swell_wave_height: number[];
    swell_wave_direction: number[];
    swell_wave_period: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    time: string[];
}
export declare class Report {
    id: string;
    spot_id: string;
    report_text: string;
    weather_data: WeatherData;
    user_preferences?: string;
    created_at: Date;
    updated_at: Date;
    spot: Spot;
}
//# sourceMappingURL=Report.d.ts.map