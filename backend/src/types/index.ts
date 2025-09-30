export interface Point {
  latitude: number;
  longitude: number;
}

export interface BestConditions {
  swell_direction: string[];
  wind_direction: string[];
  tide: string[];
  swell_size: string;
}

export interface Zone {
  id: string;
  name: string;
  best_conditions: BestConditions;
  bad_conditions?: BestConditions;
}

export interface Spot {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  zona: string;
  zona_id: number;
  zone?: Zone;
}

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

export interface Report {
  id: string;
  spot_id: string;
  report_text: string;
  weather_data: WeatherData;
  user_preferences?: string;
  created_at: Date;
  updated_at: Date;
}

/////////// USer

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}